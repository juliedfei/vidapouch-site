import Landing from "./landing/Landing";
import type { Path } from "./types";

type Props = {
 setPath: (path: Path) => void;
 openConcierge: () => void;
};

export default function StartScreen({
 setPath,
 openConcierge,
}: Props) {
 return (
   <Landing
     setPath={setPath}
     openConcierge={openConcierge}
   />
 );
}

