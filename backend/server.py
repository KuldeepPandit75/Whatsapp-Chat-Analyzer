from flask import Flask,request,jsonify
from flask_cors import CORS
import uuid
from datetime import datetime, timedelta
import threading
import time
import re
import pandas as pd
import helper
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

import io
import base64

app=Flask(__name__)

CORS(app,resources={
    r"/*": {"origins": "*"}
})

# In-memory storage for uploaded files (session_id -> {data, expiry})
file_storage = {}
storage_lock = threading.Lock()

def cleanup_expired_files():
    """Background task to remove expired files"""
    while True:
        time.sleep(300)  # Check every 5 minutes
        now = datetime.now()
        with storage_lock:
            expired_sessions = [sid for sid, info in file_storage.items() 
                              if info['expiry'] < now]
            for sid in expired_sessions:
                del file_storage[sid]
                print(f"Cleaned up expired session: {sid}")

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_expired_files, daemon=True)
cleanup_thread.start()

@app.post("/preprocess")
def preprocess():
    file = request.files.get('chatFile')
    if not file:
        return jsonify({"error": "No file named 'chatFile' in request"}), 400
    
    try:
        # Read file content
        data = file.read()
        if isinstance(data, bytes):
            data = data.decode('utf-8', errors='replace')

        # Extracting the Users list

        pattern = re.compile(r"\d{1,2}\/\d{1,2}\/\d{1,2},\s\d{1,2}:\d{2}.(?:am|pm)\s-")

        messages=pattern.split(data)
        dates=re.findall(pattern,data)
        cleaned_dates=[]
        
        for date in dates:
            new_date=date.replace("\u202f"," ")
            new_date= new_date.rstrip("-").strip()
            cleaned_dates.append(new_date)
        
        sep_msg=[]
        users=[]
        for i in range(1,len(messages)):
            splited=messages[i].split(": ")
            if(len(splited)>1):
                sep_msg.append(splited[1].strip())
                users.append(splited[0].strip())
            else:
                users.append('wp_activity')
                sep_msg.append(splited[0].strip())
        
        df=pd.DataFrame({'user':users,"msg":sep_msg,"msg_date": cleaned_dates})

        df['year']=pd.to_datetime(df['msg_date'],format="%d/%m/%y, %I:%M %p").dt.year
        df['month']=pd.to_datetime(df['msg_date'],format="%d/%m/%y, %I:%M %p").dt.month
        df['day']=pd.to_datetime(df['msg_date'],format="%d/%m/%y, %I:%M %p").dt.day
        df['hour']=pd.to_datetime(df['msg_date'],format="%d/%m/%y, %I:%M %p").dt.hour
        df['minute']=pd.to_datetime(df['msg_date'],format="%d/%m/%y, %I:%M %p").dt.minute
        df['day_name']=pd.to_datetime(df['msg_date'],format="%d/%m/%y, %I:%M %p").dt.day_name()
        df['month_name']=pd.to_datetime(df['msg_date'],format="%d/%m/%y, %I:%M %p").dt.month_name()
        df['date']=pd.to_datetime(df['msg_date'],format="%d/%m/%y, %I:%M %p").dt.date

        period=[]
        for hour in df[['day','hour']]['hour']:
            if hour==23:
                period.append(str(hour)+"-"+str("00"))
            elif hour==0:
                period.append(str("00")+"-"+str(hour+1))
            else:
                period.append(str(hour)+"-"+str(hour+1))
        
        df['period']=period

        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Store DataFrame with 2-hour expiry
        expiry_time = datetime.now() + timedelta(hours=2)
        with storage_lock:
            file_storage[session_id] = {
                'dataframe': df,
                'expiry': expiry_time,
                'filename': file.filename
            }
        
        print(f"DataFrame stored with session ID: {session_id}")
        print(f"DataFrame shape: {df.shape}")
        
        unique_users=df['user'].unique().tolist()
        # Remove system user if present
        if 'wp_activity' in unique_users:
            unique_users.remove('wp_activity')
        
        return jsonify({
            "session_id": session_id,
            "users": unique_users,
            "message_count": len(df),
            "filename": file.filename,
            "expiry": expiry_time.isoformat(),
            "message": "File preprocessed and stored successfully"
        }), 200
        
    except Exception as e:
        print("Error reading uploaded file:", e)
        return jsonify({"error": str(e)}), 500

@app.post("/show-analysis")
def showAnalysis():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # accept either "analysis_type" or "type" for compatibility

    analysis_type = data.get("analysis_type") or data.get("type")
    session_id = data.get("session_id")

    if not analysis_type or not session_id:
        return jsonify({"error": "Both 'analysis_type' and 'session_id' are required"}), 400

    # Retrieve stored dataframe for the session

    with storage_lock:
        info = file_storage.get(session_id)

    if not info:
        return jsonify({"error": "Session not found or expired"}), 404

    df = info.get("dataframe")
    filename = info.get("filename")

    # Placeholder for dispatching to the requested analysis

    print(f"Requested analysis '{analysis_type}' for session '{session_id}' (file: {filename})")

    #Fetching the top 4 number stats

    url,media,msg,words,busy_users,msg_perc_df=helper.fetch_stats(analysis_type,df)

    # Build word cloud image and encode as base64 data URL

    word_png_b64 = None
    try:
        word_img = helper.create_wordcloud(analysis_type, df)
        # helper returns a WordCloud object; convert to PIL image then to base64
        pil_img = word_img.to_image()
        buf_wc = io.BytesIO()
        pil_img.save(buf_wc, format='PNG')
        buf_wc.seek(0)
        word_png_b64 = base64.b64encode(buf_wc.getvalue()).decode('ascii')
    except Exception as e:
        print("Error generating word cloud:", e)

    # Most common words

    common_word_df=helper.most_common_words(analysis_type,df)
    com_fig,ax=plt.subplots()
    ax.barh(common_word_df[0],common_word_df[1])
    ax.set_title("Most Common Words")
    
    buf_wor=io.BytesIO()
    com_fig.savefig(buf_wor,format='png')
    buf_wor.seek(0)
    com_wor_b64=base64.b64encode(buf_wor.getvalue()).decode('ascii')
    plt.close(com_fig)

    # Most Common Emojis

    emoji_df=helper.emoji_helper(analysis_type,df)

    # Monthly Timeline

    monthly_msg=helper.monthly_timeline(analysis_type,df)
    fig,ax=plt.subplots()
    ax.plot(monthly_msg['period'],monthly_msg['msg'],color='green')
    ax.set_title("Montly Timeline")
    plt.xticks(rotation='vertical')

    month_buf=io.BytesIO()
    fig.savefig(month_buf, format='png', bbox_inches='tight', pad_inches=0.1)
    month_buf.seek(0)
    month_b64 = base64.b64encode(month_buf.getvalue()).decode('ascii')
    plt.close(fig)

    # Daily Timeline

    daily_msg=helper.daily_timeline(analysis_type,df)
    fig,ax=plt.subplots(figsize=(18,10))
    ax.plot(daily_msg['date'],daily_msg['msg'],color='green')
    ax.set_title("Daily Timeline")

    fig.tight_layout()

    daily_buf=io.BytesIO()
    fig.savefig(daily_buf, format='png', bbox_inches='tight', pad_inches=0.1)
    daily_buf.seek(0)
    daily_b64 = base64.b64encode(daily_buf.getvalue()).decode('ascii')
    plt.close(fig)

    # Week Activity map

    week_activity_df=helper.week_activity_map(analysis_type,df)

    fig,ax=plt.subplots()
    ax.bar(week_activity_df['day_name'],week_activity_df['msg'],color='green')
    ax.set_title("Week Activity Map")

    fig.tight_layout()

    week_act_buf=io.BytesIO()
    fig.savefig(week_act_buf, format='png', bbox_inches='tight', pad_inches=0.1)
    week_act_buf.seek(0)
    week_act_b64 = base64.b64encode(week_act_buf.getvalue()).decode('ascii')
    plt.close(fig)

    # Month Activity map

    month_activity_df=helper.month_activity_map(analysis_type,df)

    fig,ax=plt.subplots()
    ax.bar(month_activity_df['month_name'],month_activity_df['msg'],color='green')
    ax.set_title("Month Activity Map")
    plt.xticks(rotation='vertical')

    fig.tight_layout()

    month_act_buf=io.BytesIO()
    fig.savefig(month_act_buf, format='png', bbox_inches='tight', pad_inches=0.1)
    month_act_buf.seek(0)
    month_act_b64 = base64.b64encode(month_act_buf.getvalue()).decode('ascii')
    plt.close(fig)

    # Day Activity map

    # pivot to matrix: rows=day, cols=period, values=msg
    pivot = df.pivot_table(index='day_name', columns='period', values='msg',aggfunc='count').fillna(0)
    print(pivot)

    fig,ax=plt.subplots()
    im = ax.imshow(pivot.values, aspect='auto', cmap='YlGn')
    ax.set_title("Day Activity Heatmap")
    ax.set_xticks(range(pivot.shape[1]))
    ax.set_xticklabels(pivot.columns, rotation='vertical')
    ax.set_yticks(range(pivot.shape[0]))
    ax.set_yticklabels(pivot.index)
    fig.colorbar(im, ax=ax)

    fig.tight_layout()

    day_act_buf=io.BytesIO()
    fig.savefig(day_act_buf, format='png', bbox_inches='tight', pad_inches=0.1)
    day_act_buf.seek(0)
    day_act_b64 = base64.b64encode(day_act_buf.getvalue()).decode('ascii')
    plt.close(fig)

    # Busy Users Chart

    if(analysis_type=="Overall Analysis"):
        fig,ax=plt.subplots()
        ax.bar(busy_users.index, busy_users.values)
        ax.set_title("Most Busy Users")
        plt.xticks(rotation='vertical')

        # adjust layout to prevent cropping of labels/titles
        fig.tight_layout()

        buf=io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', pad_inches=0.1)
        buf.seek(0)
        chart_b64 = base64.b64encode(buf.getvalue()).decode('ascii')
        plt.close(fig)

        return jsonify({
            "status": "ok",
            "tot_urls":url,
            "tot_media":media,
            "tot_msgs": msg,
            "tot_words":words,
            "chart_png": f"data:image/png;base64,{chart_b64}" if chart_b64 else None,
            "word_png": f"data:image/png;base64,{word_png_b64}" if word_png_b64 else None,
            "msg_perc": msg_perc_df.to_dict(orient='records'),
            "com_word_png":  f"data:image/png;base64,{com_wor_b64}" if com_wor_b64 else None,
            "emoji_com":emoji_df.to_dict(orient='records'),
            "month_png": f"data:image/png;base64,{month_b64}" if month_b64 else None,
            "daily_png": f"data:image/png;base64,{daily_b64}" if daily_b64 else None,
            "week_act_png": f"data:image/png;base64,{week_act_b64}" if week_act_b64 else None,
            "month_act_png": f"data:image/png;base64,{month_act_b64}" if month_act_b64 else None,       
            "day_act_png": f"data:image/png;base64,{day_act_b64}" if day_act_b64 else None,       


        }), 200
    

    
    return jsonify({
        "status": "ok",
        "tot_urls":url,
        "tot_media":media,
        "tot_msgs": msg,
        "tot_words":words,
        "word_png": f"data:image/png;base64,{word_png_b64}" if word_png_b64 else None,
        "com_word_png":  f"data:image/png;base64,{com_wor_b64}" if com_wor_b64 else None,
        "emoji_com":emoji_df.to_dict(orient='records'),
        "month_png": f"data:image/png;base64,{month_b64}" if month_b64 else None,
        "daily_png": f"data:image/png;base64,{daily_b64}" if daily_b64 else None,
        "week_act_png": f"data:image/png;base64,{week_act_b64}" if week_act_b64 else None,
        "month_act_png": f"data:image/png;base64,{month_act_b64}" if month_act_b64 else None,
        "day_act_png": f"data:image/png;base64,{day_act_b64}" if day_act_b64 else None,       

    }), 200

if __name__=="__main__":
    app.run(debug=True,host="0.0.0.0",port=5000)