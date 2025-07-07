import { faBacon, faBrain, faCakeCandles, faConciergeBell, faCookie, faDashboard, faGauge, faHammer, faTruckMoving } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"


const home = [
    {
        title:"Stream Freely with UKO Credits",
        article:
        <>
        <span className="text-bold text-[25px]">UKO is your gateway to endless entertainment. </span>
        <span>Watch your favorite shows, movies, and series using</span> <span className="text-bold text-[25px]">UKO</span> <span>credits.</span>
        <p><FontAwesomeIcon className="text-[30px]" icon={faCakeCandles} /> Earn more credits simply by watching short ads.</p>
        <p><FontAwesomeIcon className="text-[30px]" icon={faConciergeBell} /> Making your streaming experience both rewarding and cost-free</p>
        <p><FontAwesomeIcon className="text-[30px]" icon={faBacon} /> Buy credits at a monthly subscription fee.</p>
        </>,     
        image:["/image/screen1.jpeg","/image/screen2.jpeg","/image/screen3.png"],
    },
    {
        title:"Watch and React in Real Time",
        article:
        <>
            <span className="text-bold text-[25px]">UKO isn't just about watching — it's about feeling.</span>
            <p><FontAwesomeIcon className="text-[30px]" icon={faBrain} /> With <span className="text-bold text-[25px]">UKO</span> reactions, users from anywhere in the world can react to content in real time.</p> 
            <p><FontAwesomeIcon className="text-[30px]" icon={faTruckMoving} /> Laugh, cry, cheer, or drop a fire emoji as the action unfolds.</p>
            <p><FontAwesomeIcon className="text-[30px]" icon={faDashboard} /> Connect with other viewers through genuine shared moments. Or monetize your reactions by sharing them with the world for celebrities or influencers.</p>
        </>,
        image:["/image/react1.png","/image/react2.png","/image/react3.png"]
    },
    {
        title:"Understand Every Word — In Your Language",
        article:
        <>
        <span className="text-bold text-[25px]">Language is no longer a barrier.</span>
        <p><FontAwesomeIcon className="text-[30px]" icon={faGauge} /> UKO’s AI-powered translator can convert audio and subtitles into your local language.</p>
        <p><FontAwesomeIcon className="text-[30px]" icon={faHammer} /> Whether it’s Swahili, French, or Hindi — enjoy content the way it was meant to be felt: clearly, naturally, and personally.</p>
        </>,  
        image:["/image/language1.png","/image/language2.jpg","/image/language3.png"]
    },
    {
        title:"Personalized Movie Recommendations with AI",
        article:
        <>
        <span className="text-bold text-[25px]">Looking for your next favorite film</span>
        <p><span className="text-bold text-[25px]">UKO</span> smart AI learns what you love and recommends content tailored to your taste.</p>
        <p><FontAwesomeIcon className="text-[30px]" icon={faCookie} /> The more you watch and react, the better your feed becomes — helping you discover hidden gems without the endless scroll.</p>
        </>,
        image:["/image/rec1.png","/image/rec2.png","/image/rec3.png"]
    },
    {
        title:"Share Local Stories. Earn from Every View",
        article:
        <>
        <span className="text-bold text-[25px]">Are you a content creator, film maker </span>
        <p><FontAwesomeIcon className="text-[30px]" icon={faCookie} /> Upload your films, skits, or documentaries to <span className="text-bold text-[25px]">UKO </span></p>
        
        <p><FontAwesomeIcon className="text-[30px]" icon={faCookie} /> Earn per view.</p>
        <p><FontAwesomeIcon className="text-[30px]" icon={faCookie} /> Promote your culture, tell your story, and monetize your creativity — all in one platform built for local voices.</p>
        </>,
        image:["/image/earn1.png","/image/earn2.png","/image/earn3.png"]
    }
]

export { home }