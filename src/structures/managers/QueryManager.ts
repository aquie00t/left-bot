/* eslint-disable no-case-declarations */
import play from 'play-dl';
import { Track } from '../../types/query';

export default class QueryManager 
{
    public constructor()
    {

    }

    public static async youtubeQuery(url: string): Promise<Track[]>
    {
        const validate = play.yt_validate(url);

        switch (validate) {
            case "search":
                const searched = await play.search(url, { source : { youtube : "video" } });
                if(searched.length == 0)
                    return [];
                return [{
                    title: searched[0].title!,
                    url: searched[0].url,
                    source: "youtube"
                }];
            case "video":
                const video = await play.video_info(url);
                return [{
                    title: video.video_details.title!,
                    url: video.video_details.url,
                    source: "youtube"
                }];
            case "playlist":
                const yt_playlist = await play.playlist_info(url);
                const yt_playlist_videos = await yt_playlist.all_videos();
                const track_array = yt_playlist_videos.map((youtube_video) => {
                    return {
                        title: youtube_video.title!,
                        url: youtube_video.url,
                        source: "youtube"
                    };
                }) as Track[];

                return track_array;
            default:
                return [];
        }    
    }
}