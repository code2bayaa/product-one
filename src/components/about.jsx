import { useState, useEffect } from "react";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav"


const ABOUT = () => {

    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Call it once to set the initial value
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    },[]) 

    return (
        <div className="w-[100%] duration-250 h-[100%] text-white flex flex-row flex-wrap" style={{background:"linear-gradient(65deg, #0d0d0d, rgba(0,0,0,0.75), #1c2a3b, #0f111a)"}}>
            {
                windowWidth > 800 ? 
                <div className="w-[20%] absolute h-[100%] border-r-[3px] border-[#2E2E3A]" style={{background:"linear-gradient(85deg, #0d0d0d, rgba(0,0,0,0.75), #000, #0f111a)"}}>
                    <NAVBAR/>
                </div>
                :
                <MOBILE/>
            }
            <div className={windowWidth > 800 ? "w-[80%] h-[100%] bg-background overflow-y-auto movie-scene ml-[20%] flex flex-col bg-[#fff]":"bg-[#fff] bg-background w-[100%] h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <div className="relative h-96 overflow-hidden">
                    <img 
                    src="/image/posters.jpg" 
                    alt="UKO movies in Mombasa"
                    className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-hero flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                        About UKO
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                        Your premier destination for movies experiences in Mombasa
                        </p>
                    </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-foreground">
                        Bringing moviess to Life in Mombasa
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        UKO is Mombasa's leading movies experience, dedicated to bringing you the latest blockbusters, 
                        indie films, and local productions in the heart of Kenya's coastal city. Located on the bustling 
                        Tom Mboya Road, we've been serving the community with premium entertainment since our inception.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                        Our state-of-the-art facilities feature cutting-edge projection technology, immersive sound systems, 
                        and comfortable seating designed to make every movies experience unforgettable.
                        </p>
                    </div>
                    
                    <div className="p-8 bg-gradient-div border-border shadow-movies">
                        <h3 className="text-2xl font-semibold mb-6 text-accent">Our Mission</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                        To create magical movies experiences that bring communities together, 
                        showcase diverse storytelling, and provide a premium entertainment 
                        destination for Mombasa and beyond.
                        </p>
                        <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-foreground">Premium viewing experience</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-foreground">Community-focused entertainment</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-foreground">Latest technology & comfort</span>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Location & Legal Info */}
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
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Monetization</h4>
                                    <p className="text-muted-foreground">
                                        Post local videos and stream with the friends while earning, our model will be pay per view hence you may earn upto $10,000 a month
                                    </p>
                                </div>
                            </div>
                        </div>
                    <div className="p-8 bg-div border-border">
                        <h3 className="text-2xl font-semibold mb-6 text-primary">Our Location</h3>
                        <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Address</h4>
                            <p className="text-muted-foreground">
                            Tom Mboya Road<br />
                            Mombasa, Kenya
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Find Us</h4>
                            <p className="text-muted-foreground">
                            Located in the heart of Mombasa's business district, easily accessible 
                            by public transport and with ample parking facilities.
                            </p>
                        </div>
                        </div>
                    </div>

                    <div className="p-8 bg-div border-border">
                        <h3 className="text-2xl font-semibold mb-6 text-primary">Legal Information</h3>
                        <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Business Registration</h4>
                            <p className="text-muted-foreground">
                            UKO movies is a legally registered business operating under Kenyan law, 
                            with full licensing and permits for entertainment services.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Rights & Licensing</h4>
                            <p className="text-muted-foreground">
                            All content screened at UKO movies is properly licensed with full legal rights 
                            for public exhibition in Kenya, ensuring compliance with international copyright laws.
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center mt-16">
                    <div className="p-12 bg-gradient-div border-border shadow-glow">
                        <h3 className="text-3xl font-bold mb-4 text-foreground">Experience movies Like Never Before</h3>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join us at UKO movies for an unforgettable movies experience in the heart of Mombasa. 
                        Check our latest showings and book your tickets today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-3 bg-gradient-primary text-primary-foreground font-semibold rounded-lg hover:shadow-glow transition-all duration-300">
                            View Showtimes
                        </button>
                        <button className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-muted transition-all duration-300">
                            Contact Us
                        </button>
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