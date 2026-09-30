// Phone + Country / County / Ward inputs (movies PRD #6, #21), shared by signup.jsx and profile.jsx.
// The lists come from the user service (GET /profile/locations): Kenya picks its county from the
// 47, any other country types it; wards are typed, with suggestions where UKO already knows them.
import { useEffect, useState } from "react";
import { profileUrl } from "./access";

let locationsLoad = null
const loadLocations = () => {
    if (!locationsLoad) {
        locationsLoad = fetch(profileUrl("/locations"))
            .then(res => res.json())
            .catch(() => { locationsLoad = null; return null })
    }
    return locationsLoad
}

export const EMPTY_PLACE = { telephone: "", country: "Kenya", county: "", ward: "" }

// the country a typed number belongs to, longest dialling code first ("+254..." is not "+2...")
const phoneCountry = (telephone, countries, picked) => {
    let digits = String(telephone || "").replace(/[\s\-().]/g, "")
    if (!digits || !countries) return null
    if (digits.startsWith("00")) digits = "+" + digits.slice(2)
    if (!digits.startsWith("+")) return picked || null //"07..." is read in the picked country
    const byDial = [...countries].sort((a, b) => b.dial.length - a.dial.length)
    return byDial.find(c => digits.startsWith("+" + c.dial)) || null
}

const inputClass = "w-[100%] m-[0.5%] h-[40px] border border-[#ccc] px-2 text-black"

const LOCATIONFIELDS = ({ value, onChange }) => {
    const [lists, setLists] = useState(null)
    useEffect(() => {
        let live = true
        loadLocations().then(data => live && data && setLists(data))
        return () => { live = false }
    }, [])

    const set = (patch) => onChange({ ...value, ...patch })
    const countries = lists?.countries || []
    const picked = countries.find(c => c.name === value.country)
    const counties = lists?.counties?.[value.country]
    const wards = lists?.wards?.[value.county] || []
    const numberFrom = phoneCountry(value.telephone, countries, picked)

    return (
        <>
            <fieldset>
                <legend>Country</legend>
                <select
                    className={inputClass}
                    value={value.country}
                    onChange={e => set({ country: e.target.value, county: "", ward: "" })}
                >
                    {countries.length === 0 && <option value={value.country}>{value.country}</option>}
                    {countries.map(c => <option key={c.iso + c.name} value={c.name}>{c.name}</option>)}
                </select>
            </fieldset>
            <fieldset>
                <legend>Phone number</legend>
                <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={picked ? `+${picked.dial} 712 345 678` : "+254 712 345 678"}
                    className={inputClass}
                    value={value.telephone}
                    onChange={e => set({ telephone: e.target.value.replace(/[^\d+\s\-()]/g, "").slice(0, 20) })}
                />
                {numberFrom && numberFrom.plays === false && (
                    <p className="text-[#b45309] text-sm">
                        A {numberFrom.name} number can register, but playing videos needs a phone number from Africa, Australia or Brazil.
                    </p>
                )}
            </fieldset>
            <fieldset>
                <legend>{value.country === "Kenya" ? "County" : "County / province / state"}</legend>
                {counties ? (
                    <select className={inputClass} value={value.county} onChange={e => set({ county: e.target.value, ward: "" })}>
                        <option value="">Pick your county</option>
                        {counties.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                ) : (
                    <input
                        type="text"
                        maxLength={80}
                        placeholder="County"
                        className={inputClass}
                        value={value.county}
                        onChange={e => set({ county: e.target.value })}
                    />
                )}
            </fieldset>
            <fieldset>
                <legend>Ward</legend>
                <input
                    type="text"
                    maxLength={120}
                    placeholder="Ward"
                    list="uko-ward-suggestions"
                    className={inputClass}
                    value={value.ward}
                    onChange={e => set({ ward: e.target.value })}
                />
                <datalist id="uko-ward-suggestions">
                    {wards.map(name => <option key={name} value={name} />)}
                </datalist>
            </fieldset>
        </>
    )
}

// the same checks the server runs, so the form can say what is missing before sending
export const placeProblem = ({ telephone, country, county, ward }) => {
    if (!country) return "Pick your country"
    if (!String(county || "").trim()) return country === "Kenya" ? "Pick your county" : "Enter your county / province"
    if (!String(ward || "").trim()) return "Enter your ward"
    const digits = String(telephone || "").replace(/[^\d]/g, "")
    if (digits.length < 8 || digits.length > 15) return "Enter a valid phone number, with its country code"
    return null
}

export default LOCATIONFIELDS
