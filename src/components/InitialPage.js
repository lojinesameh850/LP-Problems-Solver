import { Link } from "react-router-dom";

function InitialPage() {
   return(
   <>
    <div>
        <Link to="/home/others">linear programming problem</Link>
    </div>
    <div>
        <Link to="/home/goal">Goal programming problem</Link>
    </div>
   </>
   );
  }
export default InitialPage;
  