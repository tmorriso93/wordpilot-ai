

import { faFeatherPointed } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export const Logo = () => {
    // Logo component implementation
    return <div className="text-3xl text-center py-4 uppercase font-heading">
        {/* Name of the App and Logo icon*/}
        <Link href="/post/new">
        WordPilot AI 
        <FontAwesomeIcon icon={faFeatherPointed} className="text-2xl text-slate-400 pl-1"/>
        </Link>
    </div>;
};