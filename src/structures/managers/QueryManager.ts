/* eslint-disable no-case-declarations */
import play, { SpotifyAlbum, SpotifyTrack } from 'play-dl';
import { Track } from '../../types/query';
export default class QueryManager 
{
    public async setToken(): Promise<void>
    {
        return await play.setToken({
            spotify: {
                client_id: "a2e7585c4afd401e8c04300c9bff7e1c",
                client_secret: "0699bcf8439940e995de5dd05223cdf0",
                market: "es",
                refresh_token: "Bearer BQAgZ7WG7lDLQ_KYQkPhWHzFqV5f94qA7DgEcKGudl8CxlWZB0-hi2ceueoU_SlMdwXCvLQQd2VPh3sxec1Oyu_VfOtqFAkaCesV3jvg0OY8BOKM8U0"
            }
        });
    }
    public async youtubeQuery(url: string): Promise<Track[]>
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

    public async spotifyQuery(url: string): Promise<Track[]>
    {
        const validate = play.sp_validate(url);

        switch(validate)
        {
            case "playlist":
                const sp_playlist = await play.spotify(url) as SpotifyAlbum;
                const sp_playlist_tracks = await sp_playlist.all_tracks();
                const sp_playlist_result = sp_playlist_tracks.map((spotify_track) => {
                    return {
                        source: "spotify",
                        title: spotify_track.name,
                        url: spotify_track.url
                    } as Track;
                });

                return sp_playlist_result;
            case "album":
                const sp_album = await play.spotify(url) as SpotifyAlbum;
                const sp_album_tracks = await sp_album.all_tracks();
                const sp_album_result = sp_album_tracks.map((spotify_track) => {
                    return {
                        source: "spotify",
                        title: spotify_track.name,
                        url: spotify_track.url
                    } as Track;
                });

                return sp_album_result;
            case "track":
                const sp_track = await play.spotify(url) as SpotifyTrack;
                return [{
                    source: "spotify",
                    title: sp_track.name,
                    url: sp_track.url
                }];
            default:
                return [];
        }
    }
}