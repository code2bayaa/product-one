import { useState, useEffect } from "react";
import MOBILE from "./mobileBar";
import NAVBAR from "./nav"


const PRIVACY = () => {

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
                    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

                    <p className="text-sm text-gray-500 mb-8">
                        <strong>Effective Date:</strong> 08-08-2026 &nbsp;|&nbsp;
                        <strong>Last Updated:</strong> 08-08-2025
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">1. Legal Registration & Licensing</h2>
                        <p>
                        Late Bookers is registered and licensed by the Kenya Film Classification Board (KFCB) under License No. <strong>1938</strong>, valid for distribution in Kenya and across Africa. The company is the sole owner and patent holder of the <strong>UKO</strong> platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">2. Geographic Access Restrictions</h2>
                        <p>
                            UKO is licensed only for distribution in Kenya and the wider African region. We <strong>prohibit</strong> the use of Virtual Private Networks (VPNs), proxies, or similar technologies to access the platform from outside these licensed regions. We reserve the right to suspend or terminate accounts found violating this policy.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">3. Information We Collect</h2>
                        <ul className="list-disc pl-6">
                        <li>Personal Information: Name, email address, phone number</li>
                        <li>Usage Data: IP address, browser type, access times, pages viewed</li>
                        <li>Device Information: OS version, device type, device identifiers</li>
                        <li>Location Data: IP-based or device-assisted location</li>
                        <li>Payment Data: Billing info via secure third-party payment gateways</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">4. How We Use Your Information</h2>
                        <ul className="list-disc pl-6">
                        <li>To deliver and improve our streaming services</li>
                        <li>To authenticate user identity and enforce location restrictions</li>
                        <li>To analyze usage trends and personalize user experience</li>
                        <li>To process payments and manage subscriptions</li>
                        <li>To comply with legal obligations and licensing requirements</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">5. Cookies & Tracking Technologies</h2>
                        <p>
                            UKO uses cookies and similar technologies to maintain session state, analyze traffic, and enable preferences like language and playback settings. You can manage cookies in your browser settings.
                        </p>
                        <p>They are pieces of non-personally identifiable information that can be grouped into 5 categories:</p>
                        <p>
                            Strictly Necessary Cookies: These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.
                        </p>
                        <p>
                            Analytical/Performance Cookies: These allow us to record and analyze the number of visitors viewing the site, the articles they're reading most, and other details that give us insights into how our site is being used. We use Google Analytics and Piano to track our visitors, understand which pages are being read, where readers are linking from, where they are, how long they are spending on certain pages, and other information that helps us understand how our readers use our site. We do not use additional parameters within the application to attribute users browser profiles with other elements of their usage, device or location data, or other identity markers. In addition, we randomize IPs within Analytics to further prevent attribution. We retain this data by default for 26 months, at which time this randomized user data is purged and only aggregate data such as number of visits is retained. 
                        </p>
                        <p>
                            Functionality Cookies: These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies then some or all of these services may not function properly.
                        </p>
                        <p>
                            Targeting Cookies: These cookies may be set through our site by our advertising partners to record your visit to our website, the pages you have visited and the links you have followed. They may be used by those companies to build a profile of your interests and to show you relevant advertisements on our site as well as other sites you may visit. They do not store directly personal information, but are based on uniquely identifying your browser and internet device. If you do not allow these cookies, you will experience less targeted advertising and will impact the ad rates that sites like ours receive from advertisers because the ads you will see are less likely to be of interest.
                        </p>
                        <p>
                            Social Media Cookies:These cookies are set by a range of social media services that we have added to the site to enable you to share our content with your friends and networks. They are capable of tracking your browser across other sites and building up a profile of your interests. This may impact the content and messages you see on other websites you visit. If you do not allow these cookies you may not be able to use or see these sharing tools.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">6. Data Sharing & Third-Party Services</h2>
                        <p>
                            We may share your data with service providers (e.g., hosting, analytics), regulatory authorities, or payment processors, as necessary. We <strong>do not</strong> sell or rent your data.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">7. Data Security</h2>
                        <p>
                            We implement SSL encryption, authentication, and access controls to protect your data from unauthorized access, disclosure, or misuse.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
                        <p>
                        You have the right to:
                        </p>
                        <ul className="list-disc pl-6">
                        <li>Access your personal data</li>
                        <li>Request correction or deletion</li>
                        <li>Object to data processing</li>
                        <li>Withdraw consent</li>
                        <li>File a complaint with the Data Protection Commissioner</li>
                        </ul>
                        <p>To exercise these rights, contact us at <strong>info@late-developers.com</strong>.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">9. Data Retention</h2>
                        <p>
                        We retain data only as long as necessary for the purposes described, or as required by law. Afterwards, we securely delete or anonymize the data.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">10. Children’s Privacy</h2>
                        <p>
                        UKO is not intended for users under 18 unless supervised by a guardian. We do not knowingly collect data from minors without parental consent.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">11. Changes to This Policy</h2>
                        <p>
                        We may update this Privacy Policy periodically. Changes will be posted here with an updated effective date.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">12. Contact Information</h2>
                        <p>
                        For any questions or concerns, contact:
                        </p>
                        <p className="mt-2">
                        <strong>Late Bookers Ltd</strong><br />
                        Tom Mboya Rd 908452<br />
                        Email: info@late-developers.com<br />
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default PRIVACY