// "Start a reaction" on a movie / series detail page (movies PRD #11): opens the player with the reaction set-up
// (fee + public / private) already showing. Pages render it only where their Play button shows.
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";

// reactions run on the UKO player only - a title that only streams from elsewhere cannot host one
export const reactionNeedsUpload = () => Swal.fire({
    icon: "info",
    title: "Reactions need a UKO copy",
    text: "This title only plays from an outside stream, so a reaction can't be started on it yet.",
});

const ReactionButton = ({ onClick, desktop, className = "" }) => (
    <button
        type="button"
        onClick={onClick}
        className={`${desktop ? "min-w-[150px] px-[12px]" : "w-[48%]"} h-[40px] m-[1%] rounded-md border-2 border-[#ffd800] text-[#ffd800] text-[13px] font-bold flex items-center justify-center gap-[6px] hover:bg-[#ffd800] hover:text-black duration-200 ${className}`}
    >
        <FontAwesomeIcon icon={faUserGroup} /> Start a reaction
    </button>
);

export default ReactionButton;
