import { useState, useEffect } from "react";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav"


const TERMS = () => {

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
            <div className={windowWidth > 800 ? "w-[80%] h-[100%] overflow-y-auto movie-scene ml-[20%] flex flex-col bg-[#fff]":"bg-[#fff] w-[100%] h-[92%] overflow-y-auto movie-scene flex flex-col"}>
                <div className="px-6 py-12 max-w-4xl mx-auto text-gray-800">
                <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

                <p className="text-sm text-gray-500 mb-8">
                    <strong>Effective Date:</strong> 08-08-2025 &nbsp;|&nbsp;
                    <strong>Last Updated:</strong> 08-08-2025
                </p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                    <p>
                    Welcome to UKO, a platform owned and operated by Late Bookers Ltd ("we", "our", or "us"). By accessing or using UKO, you agree to comply with these Terms and Conditions. If you do not agree, you may not use the service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
                    <p>
                    You must be at least 18 years old to use UKO, or have parental/guardian consent if under 18. By using the platform, you affirm that you meet these requirements.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">3. Licensed Use & Regional Restrictions</h2>
                    <p>
                    UKO is licensed for distribution and access only in Kenya and across Africa. Users outside these regions are prohibited from accessing content through VPNs or proxy servers. Violation of this policy may result in termination of service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">4. Features and Services</h2>
                    <ul className="list-disc pl-6">
                    <li>
                        <strong>Screen Sharing:</strong> Users may engage in screen sharing sessions for social viewing and reactions. You are solely responsible for the content you share.
                    </li>
                    <li>
                        <strong>Offline Downloads:</strong> Selected content may be made available for offline viewing through a secure, encrypted download mechanism.
                    </li>
                    <li>
                        <strong>Local Content:</strong> UKO offers a catalog of licensed local films, documentaries, and series to promote African storytelling.
                    </li>
                    <li>
                        <strong>User Uploads & Monetization:</strong> Verified users may upload their own original content and opt-in to monetization programs. Revenue-sharing terms are defined separately and require approval.
                    </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">5. Content Ownership</h2>
                    <p>
                    All original content on UKO, including videos, trademarks, and technology, are owned by Late Bookers Ltd or its licensors. User-uploaded content remains the property of the uploader, but you grant us a license to display and distribute your content on the platform.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">6. User Conduct</h2>
                    <ul className="list-disc pl-6">
                    <li>Do not share, upload, or stream illegal, harmful, or infringing content.</li>
                    <li>Do not circumvent regional access restrictions.</li>
                    <li>Respect copyright and intellectual property laws.</li>
                    <li>Do not use the platform for harassment, abuse, or spam.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">7. Payments & Monetization</h2>
                    <p>
                    Subscription fees, rental charges, or any paid access is handled securely via third-party payment processors. Creators who monetize content agree to our Creator Terms, which govern payment timelines and revenue shares.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">8. Termination</h2>
                    <p>
                    We may suspend or terminate access to UKO if you violate these Terms or applicable laws. User-uploaded content may also be removed at our discretion or upon takedown requests.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">9. Disclaimers</h2>
                    <p>
                    UKO is provided “as is.” We do not guarantee uninterrupted service or error-free functionality. We are not liable for any loss or damage arising from your use of the platform, including loss of uploaded content.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
                    <p>
                    These Terms may be updated from time to time. Continued use of the platform after changes are posted constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">11. Governing Law</h2>
                    <p>
                    These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in Kenyan courts.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">12. Contact Information</h2>
                    <p>
                    For questions or concerns, contact:
                    </p>
                    <p className="mt-2">
                    <strong>Late Bookers Ltd</strong><br />
                    Tom Mboya Rd<br />
                    Email: info@late-developers.com<br />
                    </p>
                </section>
                </div>
            </div>
        </div>
    )
}

export default TERMS