// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {RouterProvider, createBrowserRouter} from "react-router-dom"

import './index.css';
// import App from './App';
// import EMPIRE from './components/index.jsx';
import MOVIES from './components/movies.jsx';
import './tailwind-output.css'
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
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import PLAY from './components/play.jsx';
import PLAYER from './components/player.jsx';
import SIGNIN from './components/signin.jsx';
import NETFLIX from './components/netflix.jsx';
import DISNEY from './components/disney.jsx';
import CREDITS from './components/credits.jsx';
import SUBSCRIBE from './components/subscribe.jsx';
import TESTSOCKETS from './components/test.jsx';
import PLAYLIST from './components/playlist.jsx';
import FOLLOW from './components/follow.jsx';
import ANIME from './components/anime.jsx';
import SIGNUP from './components/signup.jsx';
import FORGOT from './components/forgot.jsx';
import CHANGEPAGE from './components/code.jsx';
import DISCOVER from './components/discover.jsx';
import TALENT from './components/talented.jsx';
import SPEED from './components/speed.jsx';
import DOWNLOAD from './components/download.jsx';
import OFFLINE from './components/offline.jsx';
import LIBRARY from './components/library.jsx';
import TERMS from './components/terms.jsx';
import PRIVACY from './components/privacy.jsx';
import BLOGS from './components/blogs.jsx';
import ABOUT from './components/about.jsx';
import HOME from './components/home.jsx';
// import reportWebVitals from './reportWebVitals';
// import MUX from './components/mux.jsx';
// serviceWorkerRegistration.register(); // ✅ not unregister()
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('./service-worker.js')
//     .then(reg => console.log('✅ Custom Service Worker registered:', reg.scope))
//     .catch(err => console.error('❌ SW registration failed:', err));
// }

const routers = [
  {
    path : "/about",
    element : <ABOUT/>,
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
  }]

if(!navigator.onLine){
  console.log("offline")
  routers.push({
    path : "/",
    element : <DOWNLOAD/>,
    errorElement : <ERROR/>
  })
  routers.push({
    path:"/offline",
    element:<OFFLINE/>,
    errorElement:<ERROR/>
  })
}else{
  console.log("online")
  // routers.push({
  //   path : "/",
  //   element : <EMPIRE/>,
  //   errorElement : <ERROR/>
  // })
  routers.push({
    path : "/",
    element : <HOME/>,
    errorElement : <ERROR/>
  })
}

const router = createBrowserRouter(routers)
const client = new ApolloClient({

  uri: process.env.REACT_APP_environment === "development" ? process.env.REACT_APP_graphql : process.env.REACT_APP_graphql_live,

  cache: new InMemoryCache(),

});
const root = ReactDOM.createRoot(document.getElementById('build'));
root.render(
  <ApolloProvider client={client}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </ApolloProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
