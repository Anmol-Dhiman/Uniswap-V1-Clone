import logo from "../assets/logo.png"
import resume from "../assets/resume/resume.pdf"
import urls from "../constants/urls"



const NavBar = () => {

    return (
        <div className="flex w-screen flex-row justify-between px-8 pt-4 items-center nav-bar">
            <img src={logo} alt="My Image" className="h-7 w-7" />
            <div className=" flex flex-row items-center">
                <a href={urls.portfolio} target="_blank" className="nav-link">Portfolio</a>
                <a href={urls.twitter} target="_blank" className="nav-link">Twitter</a>
                <a href={urls.github} target="_blank" className="nav-link">Github</a>
                <a href={urls.linkedin} target="_blank" className="nav-link">LinkedIn</a>
                <a href={resume} download="Resume_Anmol_Dhiman.pdf" target="_blank" className="nav-link">Resume</a>
                <a target="_blank" className=" bg-[#EB0674] rounded-lg hover:blur-[0.5px] px-4  py-2 text-white font-inter text-base font-medium" href="/app" >
                    Launch App
                </a>
            </div>
        </div>
    )
}

export default NavBar