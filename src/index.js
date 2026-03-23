// index.jsx
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import './index.css';
import './tailwind-output.css';

// import ERROR from './components/error.jsx';
// import DOWNLOAD from './components/download.jsx';
// import OFFLINE from './components/offline.jsx';
// import HOME from './components/home.jsx';
// import ABOUT from './components/about.jsx';
// import BLOGS from './components/blogs.jsx';
// import MOVIES from './components/movies.jsx';
// import MOVIE from './components/movie.jsx';
// import SERIES from './components/series.jsx';
// import PERSON from './components/person.jsx';
// import SEARCH from './components/search.jsx';
// import NETFLIX from './components/netflix.jsx';
// import DISNEY from './components/disney.jsx';
// import ANIME from './components/anime.jsx';
// import SIGNIN from './components/signin.jsx';
// import SIGNUP from './components/signup.jsx';
// import LIBRARY from './components/library.jsx';
// import PRIVACY from './components/privacy.jsx';
// import TERMS from './components/terms.jsx';
// import TALENT from './components/talented.jsx';
// import DISCOVER from './components/discover.jsx';
// import SPEED from './components/speed.jsx';
import MOVIES from './components/movies.jsx';
import ERROR from './components/error.jsx';
import SERIES from './components/series.jsx';
import PEOPLE from './components/people.jsx';
import SEARCH from './components/search.jsx';
import MOVIE from './components/movie.jsx';
import SIMILAR from './components/similar.jsx';
import RECOMMENDATIONS from './components/recommendations.jsx';
import SERIE from './components/serie.jsx';
import PERSON from './components/person.jsx';
import SEASON from './components/season.jsx';
import EPISODE from './components/episode.jsx';
import TRAILER from './components/trailer.jsx';
import PLAY from './components/play.jsx';
import PLAYER from './components/player.jsx';
import SIGNIN from './components/signin.jsx';
import NETFLIX from './components/netflix.jsx';
import DISNEY from './components/disney.jsx';
import CREDITS from './components/credits.jsx';
import SUBSCRIBE from './components/subscribe.jsx';
import SUBSCRIBEAPP from './components/subscribeapp.jsx';
import TESTSOCKETS from './components/test.jsx';
import PLAYLIST from './components/playlist.jsx';
import FOLLOW from './components/follow.jsx';
import ANIME from './components/anime.jsx';
import SIGNUP from './components/signup.jsx';
import FORGOT from './components/forgot.jsx';
import CHANGEPAGE from './components/code.jsx';
import DISCOVER from './components/discover.jsx';
import DISCOVERTV from './components/discovertv.jsx';
// import TALENT from './components/talented.jsx';
import SPEED from './components/speed.jsx';
import DOWNLOAD from './components/download.jsx';
import OFFLINE from './components/offline.jsx';
import LIBRARY from './components/library.jsx';
import TERMS from './components/terms.jsx';
import PRIVACY from './components/privacy.jsx';
import BLOGS from './components/blogs.jsx';
import ABOUT from './components/about.jsx';
import HOME from './components/home.jsx';
// import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import ApolloWrapper from "./graphQL/provider";
import HINDU from './components/hindu.jsx';
import KOREA from './components/korea.jsx';
import CHINA from './components/china.jsx';
import CHANGE from './components/change.jsx';
import DEVICE from "./components/devices.jsx";
import { KeyProvider } from './components/safe.jsx';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(reg => console.log('✅ Service Worker registered:', reg.scope))
    .catch(err => console.error('❌ SW registration failed:', err));
}

const baseRoutes = [
  {
    path : "/about",
    element : <ABOUT/>,
    errorElement : <ERROR/>
  },
  {
    path : "/devices",
    element : <DEVICE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/blogs",
    element : <BLOGS/>,
    errorElement : <ERROR/>
  },
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
    path : "/hindu/movie",
    element : <MOVIE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/korea/movie",
    element : <MOVIE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/china/movie",
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
    path : "/hindu",
    element : <HINDU/>,
    errorElement : <ERROR/>
  },
  {
    path : "/korea",
    element : <KOREA/>,
    errorElement : <ERROR/>
  },
  {
    path : "/china",
    element : <CHINA/>,
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
    path : "/hindu/serie",
    element : <SERIE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/korea/serie",
    element : <SERIE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/china/serie",
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
    path:"/subscribe/:user",
    element:<SUBSCRIBEAPP/>,
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
    path:"/change",
    element:<CHANGE />,
    elementError:<ERROR />
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
  // {
  //   path:"/talent",
  //   element:<TALENT/>,
  //   elementError:<ERROR/>
  // },
  {
    path:"/discover/movie",
    element:<DISCOVER/>,
    elementError:<ERROR/>
  },
  {
    path:"/discover/tv",
    element:<DISCOVERTV/>,
    elementError:<ERROR/>
  },
  
  {
    path:"/library",
    element:<LIBRARY/>,
    elementError:<ERROR/>
  },
  {
    path:"/privacy",
    element:<PRIVACY/>,
    elementError:<ERROR/>
  },
  {
    path:"/terms",
    element:<TERMS/>,
    elementError:<ERROR/>
  },
  { path: "/offline", element: <OFFLINE />, errorElement: <ERROR /> },
  { path: "/offline/download", element: <DOWNLOAD />, errorElement: <ERROR /> },
]

async function isReallyOnline() {
  try {
    const response = await fetch(process.env.REACT_APP_environment === "development"
      ? process.env.REACT_APP_online
      : process.env.REACT_APP_online_live);

      console.log(process.env.REACT_APP_online,response,"check online")
    return response.ok;
  } catch {
    return false;
  }
}

// 🧩 Initialize app only after connectivity check
(async function initApp() {
  const online = await isReallyOnline();
  let routes = [...baseRoutes];
  console.log(navigator)
  if (!online) {
    console.log("🔴 Offline — using offline routes");
    routes.push(
      { path: "/", element: <DOWNLOAD />, errorElement: <ERROR /> },
      { path: "/offline", element: <OFFLINE />, errorElement: <ERROR /> }
    );
  } else {

    if(navigator.onLine){
      console.log("🟢 Online — using home route");
      routes.push({ path: "/", element: <HOME />, errorElement: <ERROR /> });
    }else{
      console.log("🔴 Offline — using offline routes");
      routes.push(
        { path: "/", element: <DOWNLOAD />, errorElement: <ERROR /> },
        { path: "/offline", element: <OFFLINE />, errorElement: <ERROR /> }
      );
    }

  }

  const router = createBrowserRouter(routes);

  const root = ReactDOM.createRoot(document.getElementById('build'));
  root.render(
    <KeyProvider>
      <ApolloWrapper>
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>
      </ApolloWrapper>
    </KeyProvider>
  );
})();
