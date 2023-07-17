import logo from "../assets/logo.png"
import polygon from "../assets/polygon.svg"
import { useState } from "react"
import { FiChevronUp, FiChevronDown } from "react-icons/fi"
import Swap from "./Swap"
import { ConnectWallet } from "@thirdweb-dev/react";
import Liquidity from "./Liquidity"
import Exchange from "./Exchange"


const MainApp = () => {

    const [dropDown, setDropDown] = useState(false)
    const [selectedFeature, setSelectedFeature] = useState("swap")





    return (
        <div className="flex  flex-col  " onClick={() => { dropDown && setDropDown(false) }}>
            <nav className="flex flex-row w-full justify-between bg-[#101322] absolute px-8 py-2 border-b-[1px] border-[#56565673] ">
                <div className="flex flex-row   h-fit items-center " >
                    <button> <img src={logo} alt="logo" className=" h-7 w-7 mr-8" /></button>
                    <button className={selectedFeature == "swap" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => setSelectedFeature("swap")} >Swap</button>
                    <button className={selectedFeature == "add liquidity" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => setSelectedFeature("add liquidity")} >Liquidity</button>
                    <button className={selectedFeature == "exchange" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => setSelectedFeature("exchange")} >Exchange</button>
                </div>

                <div className="flex flex-row justify-end items-center">
                    <div className="flex flex-col">
                        <button onClick={() => {
                            setDropDown(!dropDown)
                        }} className="self-end flex flex-row items-center mr-4 px-4 py-2 hover:bg-[#1F2233] rounded-lg chain" >

                            <img src={polygon} alt="chain" className=" h-6 w-6 mr-2" />

                            {dropDown ? <FiChevronUp /> : <FiChevronDown />}

                        </button>

                        {dropDown && <div className=" absolute z-10 mt-16 w-48 right-[140px] rounded-xl px-2 py-2 border-[1px] border-[#475068] bg-[#0D111C]">

                            <button className="flex flex-row items-center w-full px-2 py-2  change-chain">
                                <img src={polygon} alt="My Image" className=" h-5 w-5 mr-2" />
                                <p className="text-white font-inter text-sm">Polygon</p>
                            </button>



                        </div>}
                    </div>
                    <ConnectWallet
                        dropdownPosition={{
                            side: "bottom",
                            align: "center",
                        }}
                    />

                </div>
            </nav >

            <div className="flex  flex-1 flex-col  mt-[60px] items-center justify-between ">

                {selectedFeature == "swap" && <Swap />}
                {selectedFeature == "add liquidity" && <Liquidity />}
                {selectedFeature == "exchange" && <Exchange />}

                <div className=" flex mt-24 text-white flex-col  items-center " >
                    <div className="font-light">This is not the optimized version it could lag while making operations</div>
                    <div className="font-semibold" >@2023 ANMOL ALL RIGHTS RESERVED</div>
                </div>
            </div>








        </div >





    )
}

export default MainApp