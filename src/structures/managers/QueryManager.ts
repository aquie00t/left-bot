/* eslint-disable no-case-declarations */
import play, { SpotifyAlbum, SpotifyTrack } from 'play-dl';
import { Track } from '../../types/query';
import tokenOptions from '../../../tokenOptions.json';

export default class QueryManager 
{
    public async setToken(): Promise<void>
    {
        return await play.setToken({
            spotify: {
                client_id: tokenOptions.spotify.client_id,
                client_secret: tokenOptions.spotify.client_secret,
                market: tokenOptions.spotify.market,
                refresh_token: tokenOptions.spotify.refresh_token
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
                    source: "youtube",
                    stream_url: searched[0].url
                }];
            case "video":
                const video = await play.video_info(url);
                return [{
                    title: video.video_details.title!,
                    url: video.video_details.url,
                    source: "youtube",
                    stream_url: video.video_details.url
                }];
            case "playlist":
                const yt_playlist = await play.playlist_info(url);
                const yt_playlist_videos = await yt_playlist.all_videos();
                const track_array = yt_playlist_videos.map((youtube_video) => {
                    return {
                        title: youtube_video.title!,
                        url: youtube_video.url,
                        source: "youtube",
                        stream_url: youtube_video.url
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
                        url: spotify_track.url,
                        sp_data: `${spotify_track.artists[0].name} ${spotify_track.name}`,
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
                        url: spotify_track.url,
                        sp_data: `${spotify_track.artists[0].name} ${spotify_track.name}`
                    } as Track;
                });

                return sp_album_result;
            case "track":
                const sp_track = await play.spotify(url) as SpotifyTrack;
                return [{
                    source: "spotify",
                    title: sp_track.name,
                    url: sp_track.url,
                    sp_data: `${sp_track.artists[0].name} ${sp_track.name}`
                }];
            default:
                return [];
        }
    }
}