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
import EDENMOVIES from './components/eden/movies.jsx';
import EDENSERIES from './components/eden/series.jsx';
import EDENMOVIE from './components/eden/movie.jsx';
import EDENSERIE from './components/eden/serie.jsx';
import EDENPERSON from './components/eden/person.jsx';
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
import EARNPAGE from './components/earn.jsx';
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
import RECENT from "./components/recently.jsx";
import NEIGHBOR from "./components/neighbors.jsx";
import { KeyProvider } from './components/safe.jsx';
import { CREDITGATE, APPCREDITGATE } from './components/eden/shared.jsx';
import { REQUIRELOGIN } from './components/access.jsx';
import PARTYJOIN from './components/party/join.jsx';
import REACTIONSPAGE from './components/party/reactions.jsx';
import PROFILE from './components/profile.jsx';

// PRD #5: blockbuster movies / series and their players need a signed-in account; Eden pages
// (/eden/*, /movies/eden, /series/eden) stay open, and REQUIRELOGIN lets an Eden /speed through
const LOGIN_ROUTES = new Set([
  "/movies", "/movies/id", "/movies/:stream/:name", "/people/movie", "/playlist/movie",
  "/anime/movie", "/disney/movie", "/netflix/movie", "/hindu/movie", "/korea/movie", "/china/movie",
  "/series", "/series/id", "/people/serie", "/playlist/series",
  "/anime/serie", "/disney/serie", "/netflix/serie", "/hindu/serie", "/korea/serie", "/china/serie",
  "/series/season", "/playlist/season", "/series/episode", "/playlist/episode",
  "/speed", "/play", "/video/movie", "/video/episode", "/profile", "/party", "/reactions",
])

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js') //absolute: on /eden/movies a relative path asks for /eden/service-worker.js
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
  // Eden studio pages live under /eden/*; the older /movies/eden and /series/eden paths stay as
  // aliases so links already shared keep opening
  {
    path : "/eden/movies",
    element : <EDENMOVIES/>,
    errorElement : <ERROR/>
  },
  {
    path : "/eden/movies/id",
    element : <EDENMOVIE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/eden/series",
    element : <EDENSERIES/>,
    errorElement : <ERROR/>
  },
  {
    path : "/eden/series/id",
    element : <EDENSERIE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/eden/people/id",
    element : <EDENPERSON/>,
    errorElement : <ERROR/>
  },
  {
    path : "/movies/eden",
    element : <EDENMOVIES/>,
    errorElement : <ERROR/>
  },
  {
    path : "/movies/eden/id",
    element : <EDENMOVIE/>,
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
    // PRD #11 watch party invite links
    path : "/party",
    element : <PARTYJOIN/>,
    errorElement : <ERROR/>
  },
  {
    // live public reactions (PRD #11), from the nav's "reactions"
    path : "/reactions",
    element : <REACTIONSPAGE/>,
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
    path : "/series/eden",
    element : <EDENSERIES/>,
    errorElement : <ERROR/>
  },
  {
    path : "/series/eden/id",
    element : <EDENSERIE/>,
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
    path:"/recent",
    element:<RECENT/>,
    elementError:<ERROR/>
  },
  {
    path:"/neighbors",
    element:<NEIGHBOR/>,
    elementError:<ERROR/>
  },
  {
    path:"/credits",
    element:<CREDITS/>,
    elementError:<ERROR/>
  },
  {
    path:"/earn",
    element:<CREDITGATE><EARNPAGE/></CREDITGATE>,
    elementError:<ERROR/>
  },
  {
    path:"/subscribe",
    element:<CREDITGATE><SUBSCRIBE/></CREDITGATE>,
    elementError:<ERROR/>
  },
  {
    path:"/subscribe/:user",
    element:<APPCREDITGATE><SUBSCRIBEAPP/></APPCREDITGATE>,
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
    path:"/profile",
    element:<PROFILE />,
    elementError:<ERROR />
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
    const response = await fetch(process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_ONLINE : process.env.REACT_APP_ONLINE_LIVE);

      console.log(process.env.REACT_APP_ONLINE_LIVE,response,"check online")
    return response.ok;
  } catch {
    return false;
  }
}

// async function runTest() {
//   try {
//     console.log("running")
//     const response = await fetch(`https://download.uko-app.co.ke/test`,{
//       method:"POST",
//       body:JSON.stringify({
//         message:"You are the first"
//       }),
//       headers:{
//         "Content-type": "application/json; charset=UTF-8"
//       }
//     });
//     const res = await response.json()

//     console.log(res)
//   } catch(err) {
//     console.log("error" + err)
//     return false;
//   }
// }

// 🧩 Initialize app only after connectivity check
(async function initApp() {
  const online = await isReallyOnline();
  console.log(online,"online")
  // runTest()
  let routes = baseRoutes.map(route => LOGIN_ROUTES.has(route.path)
    ? { ...route, element: <REQUIRELOGIN>{route.element}</REQUIRELOGIN> }
    : route);
  // console.log(navigator)
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
