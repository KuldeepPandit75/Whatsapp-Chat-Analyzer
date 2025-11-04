from urlextract import URLExtract
from wordcloud import WordCloud
from collections import Counter
import pandas as pd
import emoji

extractor = URLExtract()

def fetch_stats(user_type,df):
    if user_type=="Overall Analysis":

        msg_ser=df[df['user']!='wp_activity']['msg']
        all_msgs=msg_ser[msg_ser!="<Media omitted>"].tolist()
        urls=extractor.find_urls(" ".join(all_msgs))

        busy_users=df['user'].value_counts().head()
        msg_perc_df=round((df['user'].value_counts()/df.shape[0])*100,2).reset_index().rename(columns={'user':'name','count':'percentage'})

        tot_msg=df[df['user']!='wp_activity'].shape[0]
        tot_words=len(" ".join(all_msgs).split())
        tot_media=msg_ser[msg_ser=="<Media omitted>"].shape[0]
        tot_url=len(urls)
        
        return tot_url,tot_media,tot_msg,tot_words,busy_users,msg_perc_df

    else:
        msg_ser=df[df['user']==user_type]['msg']
        all_msgs=msg_ser[msg_ser!="<Media omitted>"].tolist()
        urls=extractor.find_urls(" ".join(all_msgs))

        tot_msg=df[df['user']==user_type].shape[0]
        tot_words=len(" ".join(all_msgs).split())
        tot_media=msg_ser[msg_ser=="<Media omitted>"].shape[0]
        tot_url=len(urls)
        busy_users=None
        msg_perc_df=None

        return tot_url,tot_media,tot_msg,tot_words,busy_users,msg_perc_df

def create_wordcloud(user_type,df):
    df=df[df['msg']!="<Media omitted>"]
    df=df[df['user']!="wp_activity"]
    if user_type!="Overall Analysis":
        df=df[df["user"]==user_type]

    f= open("stop_hinglish.txt","r",encoding='utf-8')
    stop_data=f.read()

    filtered_words=[]
    all_msgs=df['msg'].str.cat(sep=" ").split()
    for msg in all_msgs:
        if msg.lower() not in stop_data.split("\n"):
            filtered_words.append(msg)
    Counter(filtered_words)

    wc=WordCloud(width=500,height=500,min_font_size=10,background_color='white')
    df_wc=wc.generate(" ".join(filtered_words))

    return df_wc

def most_common_words(user_type,df):
    df=df[df['msg']!="<Media omitted>"]
    df=df[df['user']!="wp_activity"]
    if user_type!="Overall Analysis":
        df=df[df["user"]==user_type]

    f= open("stop_hinglish.txt","r",encoding='utf-8')
    stop_data=f.read()

    filtered_words=[]
    all_msgs=df['msg'].str.cat(sep=" ").split()
    for msg in all_msgs:
        if msg.lower() not in stop_data.split("\n"):
            filtered_words.append(msg)
    return pd.DataFrame(Counter(filtered_words).most_common(20))

    
def emoji_helper(user_type,df):
    if user_type!="Overall Analysis":
        df=df[df["user"]==user_type]

    emojis=[]
    for msg in df['msg']:
        emojis.extend([c for c in msg if c in emoji.EMOJI_DATA])

    counts = Counter(emojis)
    total = sum(counts.values())

    # Build a percentage table similar to msg_perc_df (name, percentage)
    if total == 0:
        return pd.DataFrame(columns=['name', 'percentage'])

    rows = []
    for emj, cnt in counts.most_common():
        pct = round((cnt / total) * 100, 2)
        rows.append((emj, pct))

    emoji_df = pd.DataFrame(rows, columns=['name', 'percentage'])
    return emoji_df

def monthly_timeline(user_type,df):
    if user_type!="Overall Analysis":
        df=df[df["user"]==user_type]
    
    

    monthly_msg=df.groupby(['year','month_name','month']).count()['msg'].reset_index()
    monthly_msg.sort_values(by=['year','month'],inplace=True)
    monthly_msg['year']=monthly_msg['year'].astype('str')
    monthly_msg['period']=monthly_msg['month_name']+"-"+monthly_msg['year']

    return monthly_msg

def daily_timeline(user_type,df):
    if user_type!="Overall Analysis":
        df=df[df["user"]==user_type]
    

    daily_msg=df.groupby('date').count()['msg'].reset_index()

    return daily_msg

def week_activity_map(user_type,df):
    if user_type!="Overall Analysis":
        df=df[df["user"]==user_type]

    week_activity_df=df.groupby('day_name').count()['msg'].reset_index().sort_values(by=['msg'],ascending=False)

    return week_activity_df

def month_activity_map(user_type,df):
    if user_type!="Overall Analysis":
        df=df[df["user"]==user_type]

    month_activity_df=df.groupby('month_name').count()['msg'].reset_index().sort_values(by=['msg'],ascending=False)

    return month_activity_df

