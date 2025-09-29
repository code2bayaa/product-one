import { useEffect, useState } from "react";
import {RouterProvider, createBrowserRouter} from "react-router-dom"
import PLAY from './play.jsx';
import PLAYER from './player.jsx';
import SIGNIN from './signin.jsx';
import NETFLIX from './netflix.jsx';
import DISNEY from './disney.jsx';
import CREDITS from './credits.jsx';
import SUBSCRIBE from './subscribe.jsx';
import TESTSOCKETS from './test.jsx';
import PLAYLIST from './playlist.jsx';
import FOLLOW from './follow.jsx';
import ANIME from './anime.jsx';
import SIGNUP from './signup.jsx';
import FORGOT from './forgot.jsx';
import CHANGEPAGE from './code.jsx';
import DISCOVER from './discover.jsx';
import TALENT from './talented.jsx';
import SPEED from './speed.jsx';
import DOWNLOAD from './download.jsx';
import OFFLINE from './offline.jsx';
import ERROR from './error.jsx';
import SERIES from './series.jsx';
import PEOPLE from './people.jsx';
import SEARCH from './search.jsx';
import MOVIE from './movie.jsx';
import SIMILAR from './similar.jsx';
import RECOMMENDATIONS from './recommendations.jsx';
import SERIE from './serie.jsx';
import PERSON from './person.jsx';
import SEASON from './season.jsx';
import EPISODE from './episode.jsx';
import TRAILER from './trailer.jsx';
import EMPIRE from './index.jsx';
import MOVIES from './movies.jsx';
const DynamicRouters = () => {
    const [router, setRouter] = useState(null)

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('✅ Custom Service Worker registered:', reg.scope))
                .catch(err => console.error('❌ SW registration failed:', err));
        }
    },[])
    const moreRouters = [
    {
        path : "/movies",
        element : <MOVIES/>,
        errorElement : <ERROR/>
    },
    {
        path : "/movies/id",
        element : <MOVIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/anime/movie",
        element : <MOVIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/disney/movie",
        element : <MOVIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/netflix/movie",
        element : <MOVIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/playlist/movie",
        element : <MOVIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/movies/similar",
        element : <SIMILAR/>,
        errorElement : <ERROR/>
    },
    {
        path : "/movies/recommendations",
        element : <RECOMMENDATIONS/>,
        errorElement : <ERROR/>
    },
    {
        path : "/movies/trailer",
        element : <TRAILER/>,
        errorElement : <ERROR/>
    },
    {
        path : "/movies/person",
        element : <PERSON/>,
        errorElement : <ERROR/>
    },
    {
        path : "/video/movie",
        element : <PLAY/>,
        errorElement : <ERROR/>
    },
    {
        path : "/speed",
        element : <SPEED/>,
        errorElement : <ERROR/>
    },
    {
        path : "/movies/:stream/:name",
        element : <MOVIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/netflix",
        element : <NETFLIX/>,
        errorElement : <ERROR/>
    },
    {
        path : "/disney",
        element : <DISNEY/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series",
        element : <SERIES/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/id",
        element : <SERIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/anime/serie",
        element : <SERIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/disney/serie",
        element : <SERIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/netflix/serie",
        element : <SERIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/playlist/series",
        element : <SERIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/trailer",
        element : <TRAILER/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/person",
        element : <PERSON/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/season/trailer",
        element : <TRAILER/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/episode/trailer",
        element : <TRAILER/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/similar",
        element : <SIMILAR/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/recommendations",
        element : <RECOMMENDATIONS/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/season",
        element : <SEASON/>,
        errorElement : <ERROR/>
    },
    {
        path : "/playlist/season",
        element : <SEASON/>,
        errorElement : <ERROR/>
    },
    {
        path : "/series/episode",
        element : <EPISODE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/playlist/episode",
        element : <EPISODE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/video/episode",
        element : <PLAY/>,
        errorElement : <ERROR/>
    },
    {
        path : "/people",
        element : <PEOPLE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/people/id",
        element : <PERSON/>,
        errorElement : <ERROR/>
    },
    {
        path : "/people/movie",
        element : <MOVIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/people/serie",
        element : <SERIE/>,
        errorElement : <ERROR/>
    },
    {
        path : "/search",
        element : <SEARCH/>,
        errorElement : <ERROR/>
    },
    {
        path:"/play",
        element:<PLAYER/>,
        elementError:<ERROR/>
    },
    {
        path:"/signin",
        element:<SIGNIN/>,
        elementError:<ERROR/>
    },
    {
        path:"/credits",
        element:<CREDITS/>,
        elementError:<ERROR/>
    },
    {
        path:"/subscribe",
        element:<SUBSCRIBE/>,
        elementError:<ERROR/>
    },
    {
        path:"/playlist",
        element:<PLAYLIST/>,
        elementError:<ERROR/>
    },
    {
        path:"/follow",
        element:<FOLLOW/>,
        elementError:<ERROR/>
    },
    {
        path:"/follow/people",
        element:<PEOPLE/>,
        elementError:<ERROR/>
    },
    {
        path:"/test",
        element:<TESTSOCKETS/>,
        elementError:<ERROR/>
    },
    {
        path:"/anime",
        element:<ANIME/>,
        elementError:<ERROR/>
    },
    {
        path:"/signup",
        element:<SIGNUP/>,
        elementError:<ERROR/>
    },
    {
        path:"/forgot",
        element:<FORGOT/>,
        elementError:<ERROR/>
    },
    {
        path:"/forgot/code",
        element:<CHANGEPAGE/>,
        elementError:<ERROR/>
    },
    {
        path:"/talent",
        element:<TALENT/>,
        elementError:<ERROR/>
    },
    {
        path:"/discover",
        element:<DISCOVER/>,
        elementError:<ERROR/>
    }
    ]

    useEffect(() => {
        const updateRoutes = () => {
            const isOnline = navigator.onLine;
            console.log("online : " + isOnline)
            const routes = isOnline
            ? [{
                path: "/",
                element: <EMPIRE />,
                errorElement: <ERROR />
                }]
            : [{
                path: "/",
                element: <DOWNLOAD />,
                errorElement: <ERROR />
                }, {
                path: "/offline",
                element: <OFFLINE />,
                errorElement: <ERROR />
                }];
            const router = createBrowserRouter([...moreRouters,...routes])
            setRouter(router);
            
        };

        window.addEventListener('online', updateRoutes);
        window.addEventListener('offline', updateRoutes);

        updateRoutes(); // initial check

        return () => {
            window.removeEventListener('online', updateRoutes);
            window.removeEventListener('offline', updateRoutes);
        };
    }, []);

    
    return (
        router && <RouterProvider router={router} />
    )
}

export default DynamicRouters