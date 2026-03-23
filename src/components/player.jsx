import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import PLYR from "../midlleware/plyr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
// import { COLLECT } from "../midlleware/report";

const PLAYER = () => {
  const hasFetched = useRef({ rate: false, authentication: false });
  const { state } = useLocation();
  const {
    index,
    id,
    type,
    background,
    many,
    seasons,
    serie_name,
    serieID,
    episodes,
    season,
    episode,
  } = state;

  const [windowWidth, setWindowWidth] = useState(0);
  const [subFiles,setFiles] = useState([]);
  const [views, setViews] = useState(1000)
  const navigate = useNavigate();

  let count = 0;
  useEffect(() => {
    const insertViews = async () => {
      fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_INSERT_VIEWS : process.env.REACT_APP_INSERT_VIEWS_LIVE}`, {
          method: "POST",
          credentials: "include",
          headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
          },
          body: JSON.stringify({
              movies_id: id,
              // email: await AsyncStorage.getItem("user"),
              platform: "web",
              wireframe: "player"
          })
      })
          .then(res => {
              console.log(res)
              if (!res.ok) {
                  throw new Error('Network response was not ok');
              }
              return res.json();
          })
          .then(({ status, count }) => {
              if (status) {
                  // console.log("check views")
                  setViews(prevView => (prevView + count))
              }
          })
    }

    insertViews()
  }, [])
  // useEffect(() => {
  //   let name = `
  //     ${serie_name}
  //     ${season && "||" + season}
  //     ${episode && "||" + episode}
  //   `;
  //   !count && COLLECT(name);
  //   count++;
  // }, [count, serie_name, season, episode]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (hasFetched.current.authentication) return;
    hasFetched.current.authentication = true;

    try {
      async function authentication() {
        const res = await fetch(
          process.env.REACT_APP_ENVIRONMENT === "development"
            ? process.env.REACT_APP_API_URL
            : process.env.REACT_APP_API_URL_LIVE,
          { credentials: "include" }
        );
        return await res.json();
      }

      authentication().then(async (isLoggedIn) => {
        let hasPaid = false;

        if (isLoggedIn.status) {
          const response = await fetch(
            process.env.REACT_APP_ENVIRONMENT === "development"
              ? process.env.REACT_APP_USER_PAID
              : process.env.REACT_APP_USER_PAID_LIVE,
            {
              credentials: "include",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ id }),
            }
          );

          const response_data = await response.json();

          if (response_data.status) {
            const res = await fetch(
              process.env.REACT_APP_ENVIRONMENT === "development"
                ? process.env.REACT_APP_UPDATE_USER_CREDITS
                : process.env.REACT_APP_UPDATE_USER_CREDITS_LIVE,
              {
                credentials: "include",
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({ type, id }),
              }
            );
            const { success } = await res.json();
            if (success) hasPaid = true;
          } else {
            const res = await fetch(
              process.env.REACT_APP_ENVIRONMENT === "development"
                ? process.env.REACT_APP_PAY_USER_CREDITS
                : process.env.REACT_APP_PAY_USER_CREDITS_LIVE,
              {
                credentials: "include",
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  credit: 50.0,
                  data: {
                    receipt: "player",
                    "player-type": [type],
                    title: id,
                  },
                }),
              }
            );
            const { status } = await res.json();
            if (status) {
              hasPaid = true;
              Swal.fire({
                icon: "success",
                title: "paid with credits",
                showConfirmButton: false,
                timer: 2500,
              });
            }
          }
        } else {
          let user = localStorage.getItem("session");

          const res = await fetch(
            process.env.REACT_APP_ENVIRONMENT === "development"
              ? process.env.REACT_APP_PAID
              : process.env.REACT_APP_PAID_LIVE,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ user, id }),
            }
          );

          const res_data = await res.json();

          if (res_data.status) {
            const res = await fetch(
              process.env.REACT_APP_ENVIRONMENT === "development"
                ? process.env.REACT_APP_UPDATE_REPORT_CREDITS
                : process.env.REACT_APP_UPDATE_REPORT_CREDITS_LIVE,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({ user, type, id }),
              }
            );
            const { success } = await res.json();
            if (success) hasPaid = true;
          } else {
            const response = await fetch(
              process.env.REACT_APP_ENVIRONMENT === "development"
                ? process.env.REACT_APP_PAY_REPORT_CREDITS
                : process.env.REACT_APP_PAY_REPORT_CREDITS_LIVE,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  user,
                  credit: 50.0,
                  data: {
                    receipt: "player",
                    "player-type": [type],
                    title: id,
                  },
                }),
              }
            );
            const { status } = await response.json();
            if (status) {
              hasPaid = true;
              Swal.fire({
                icon: "success",
                title: "paid with credits",
                showConfirmButton: false,
                timer: 2500,
              });
            }
          }
        }

        if (!hasPaid) navigate(-1);
      });
    } catch (error) {
      console.log(error);
    }
  }, [type, id, navigate]);

  useEffect(() => {
    async function getSubtitles() {
      try {
        const response = await fetch(
          process.env.REACT_APP_ENVIRONMENT === "development"
            ? process.env.REACT_APP_SUBTITLES_FILES
            : process.env.REACT_APP_SUBTITLES_FILES_LIVE,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              id,
              index,
            }),
          }
        );
        const { status, files } = await response.json();
        console.log("gotten files: " + files)
        if(status) {
          setFiles([...files])
        }
      } catch (error) {
        console.log("Error fetching subtitles:", error);
      }
    }
    getSubtitles()
  },[index,id])

  return (
    <div
      className="w-full h-full overflow-y-auto text-white"
      style={{
        backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.75), hsl(220, 70%, 10%)), url(${
          typeof background === "object"
            ? process.env.REACT_APP_IMG_POSTER + background.path
            : process.env.REACT_APP_IMG_POSTER + "/" + background + ".jpg"
        })`,
      }}
    >
      <p className="text-white">
        {views} <FontAwesomeIcon icon={faEye} />
      </p>
      <PLYR
        videoUrl={`${
          process.env.REACT_APP_ENVIRONMENT === "development"
            ? process.env.REACT_APP_HOST_PLAY
            : process.env.REACT_APP_HOST_PLAY_LIVE
        }/${id}/${index}/${serie_name.replace(/\s+/, '.').trim()}`}
        subtitleUrl={`${
          process.env.REACT_APP_ENVIRONMENT === "development"
            ? process.env.REACT_APP_SUB_PLAYING
            : process.env.REACT_APP_SUB_PLAYING_LIVE
        }/${id}/${index}`}
        subFiles={subFiles}
      />
    </div>
  );
};

export default PLAYER;
