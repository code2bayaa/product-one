import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {RouterProvider, createBrowserRouter} from "react-router-dom"

import './index.css';
// import App from './App';
import EMPIRE from './components/index.jsx';
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
// import reportWebVitals from './reportWebVitals';
// import MUX from './components/mux.jsx';

const router = createBrowserRouter([
  {
    path : "/",
    element : <EMPIRE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/movies",
    element : <MOVIES/>,
    errorElement : <ERROR/>
  },
  {
    path : "/movies/:id",
    element : <MOVIE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/movies/similar/:stream/:id/:background",
    element : <SIMILAR/>,
    errorElement : <ERROR/>
  },
  {
    path : "/movies/recommendations/:stream/:id/:background",
    element : <RECOMMENDATIONS/>,
    errorElement : <ERROR/>
  },
  {
    path : "/movies/video/:stream/:id/:background",
    element : <TRAILER/>,
    errorElement : <ERROR/>
  },
  {
    path : "/video/:stream/:id/:name/:year/:date/:imdbId/:background",
    element : <PLAY/>,
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
    path : "/series/:id",
    element : <SERIE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/series/video/:stream/:id/:background",
    element : <TRAILER/>,
    errorElement : <ERROR/>
  },
  {
    path : "/series/video/:stream/:id/:season/:episode/:background",
    element : <TRAILER/>,
    errorElement : <ERROR/>
  },
  {
    path : "/series/similar/:stream/:id/:background",
    element : <SIMILAR/>,
    errorElement : <ERROR/>
  },
  {
    path : "/series/recommendations/:stream/:id/:background",
    element : <RECOMMENDATIONS/>,
    errorElement : <ERROR/>
  },
  {
    path : "/series/:id/:seasonID/:season/:name/:background",
    element : <SEASON/>,
    errorElement : <ERROR/>
  },
  {
    path : "/series/:id/:episodeID/:season/:episode/:name/:background",
    element : <EPISODE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/video/:stream/:id/:name/:season/:episode/:date/:imdbId/:background",
    element : <PLAY/>,
    errorElement : <ERROR/>
  },
  {
    path : "/people",
    element : <PEOPLE/>,
    errorElement : <ERROR/>
  },
  {
    path : "/people/:id",
    element : <PERSON/>,
    errorElement : <ERROR/>
  },
  {
    path : "/search",
    element : <SEARCH/>,
    errorElement : <ERROR/>
  },
  {
    path:"/play/:id/:host/:index/:type/:background",
    element:<PLAYER/>,
    elementError:<ERROR/>
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
    path:"/test",
    element:<TESTSOCKETS/>,
    elementError:<ERROR/>
  }
])
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
