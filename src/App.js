import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import GoalForm from "./components/Goal";
import OthersForm from "./components/Others";
import InitialPage from "./components/InitialPage";
import Solution from "./components/Solution";

const LinearProgrammingModel = () => {
 return(
  
    <Router>
      <InitialPage />
        {/* <nav>
          <Link to="/home">Home</Link>
        </nav> */}
        <Routes>
          <Route path="/home" element={<InitialPage />} />
          <Route path="/home/others" element={<OthersForm />} />
          <Route path="/home/goal" element={<GoalForm />} />
          <Route path="/home/solution" element={<Solution/>} />
        </Routes>
    </Router>
 );
}
export default LinearProgrammingModel;
