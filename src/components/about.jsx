import MOBILE from "./mobileBar";
import NAVBAR from "./nav"
import { useWindowWidth, DESKTOP_WIDTH } from "../hooks/useWindowWidth";

const PRODUCERS_EMAIL = "producers@uko-app.co.ke"
const PRODUCERS_SITE = "producers.uko-app.co.ke"

const ABOUT = () => {

    const windowWidth = useWindowWidth()

    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth >= DESKTOP_WIDTH ?
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth >= DESKTOP_WIDTH ? "w-[80%] h-[100%] bg-background overflow-y-auto movie-scene ml-[20%] flex flex-col bg-[#fff]":"bg-[#fff] bg-background w-[100%] h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <div className="relative h-96 overflow-hidden">
                    <img
                    src="/image/posters.jpg"
                    alt="UKO movies"
                    className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-hero flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                        About UKO
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                        Trending films for Kenya and East Africa, monetized fairly for the people who make them
                        </p>
                    </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-foreground">
                        The best algorithm for what's trending
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        UKO runs one of the best recommendation algorithms around. It notices what viewers are
                        watching and points them to the content that is trending right now, from local
                        productions to the latest blockbusters.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                        We then work directly with producers and film owners to monetize that attention, so every
                        view of a trending title turns into earnings for the people behind it.
                        </p>
                    </div>

                    <div className="p-8 bg-gradient-div border-border shadow-movies">
                        <h3 className="text-2xl font-semibold mb-6 text-accent">Our Mission</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                        To connect African audiences with the stories they love, and to make film a sustainable
                        business for the producers who tell them.
                        </p>
                        <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-foreground">Smart discovery of trending content</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-foreground">Direct partnerships with producers & film owners</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-foreground">Monetization built for African creators</span>
                        </div>
                        </div>
                    </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-div border-border">
                            <h3 className="text-2xl font-semibold mb-6 text-primary">Upcoming Features</h3>
                            <p>we need your help to make this app great</p>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Reactions</h4>
                                    <p className="text-muted-foreground">
                                        Free Streaming with the hottest and trendest celebrities, or even friends and family, have fun.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Remote Control TV app via Phone</h4>
                                    <p className="text-muted-foreground">
                                        Control your coming UKO tv app with the ease that comes with your phone. Swipe, click and watch.
                                    </p>
                                </div>
                            </div>
                        </div>
                    <div className="p-8 bg-div border-border">
                        <h3 className="text-2xl font-semibold mb-6 text-primary">Where We Operate</h3>
                        <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Africa, starting at home</h4>
                            <p className="text-muted-foreground">
                            We operate across Africa, with our main focus on Kenya and the wider
                            East African region.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Local stories, regional reach</h4>
                            <p className="text-muted-foreground">
                            Kenyan and East African productions sit alongside international titles, so local
                            films get the same shot at trending.
                            </p>
                        </div>
                        </div>
                    </div>

                    <div className="p-8 bg-div border-border">
                        <h3 className="text-2xl font-semibold mb-6 text-primary">For Producers & Film Owners</h3>
                        <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Monetize your films</h4>
                            <p className="text-muted-foreground">
                            Own the rights to a film or series? We'll take you through licensing, placement and
                            how your content earns on UKO.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Reach us</h4>
                            <p className="text-muted-foreground">
                            Email: <a href={`mailto:${PRODUCERS_EMAIL}`} className="underline">{PRODUCERS_EMAIL}</a><br />
                            Website: <a href={`https://${PRODUCERS_SITE}`} target="_blank" rel="noreferrer" className="underline">{PRODUCERS_SITE}</a>
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center mt-16">
                    <div className="p-12 bg-gradient-div border-border shadow-glow">
                        <h3 className="text-3xl font-bold mb-4 text-foreground">Are you a producer?</h3>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Put your films in front of audiences across Kenya and East Africa, and let us handle
                        the monetization.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href={`https://${PRODUCERS_SITE}`} target="_blank" rel="noreferrer" className="px-8 py-3 bg-gradient-primary text-primary-foreground font-semibold rounded-lg hover:shadow-glow transition-all duration-300">
                            Visit {PRODUCERS_SITE}
                        </a>
                        <a href={`mailto:${PRODUCERS_EMAIL}`} className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-muted transition-all duration-300">
                            Email us
                        </a>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}

export default ABOUT
