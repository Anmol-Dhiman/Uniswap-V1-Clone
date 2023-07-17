import { useState, useEffect } from "react"
import { FiChevronDown } from "react-icons/fi"
import { useSDK } from "@thirdweb-dev/react";

import polygon from "../assets/polygon.svg"
import { ThreeDots } from 'react-loader-spinner'
import { AiOutlineClose } from "react-icons/ai"
import { abi } from "../abi/Factory.json";
import exchangeAbi from "../abi/Exchange.json"
import tokenContractAbi from "../abi/ERC20.json"
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";


const Swap = () => {
    const sdk = useSDK()
    const factoryContractAddress = import.meta.env.VITE_FACTORY_CONTRACT

    const factoryContract = new ethers.Contract(`${factoryContractAddress}`, abi, sdk?.getProvider())




    const [fromValue, setFromValue] = useState("")
    const [toValue, setToValue] = useState("")

    const [fromToken, setFromToken] = useState({ exchange: "", token: '', symbol: '' })
    const [toToken, setToToken] = useState({ exchange: "", token: '', symbol: '' })




    const [isLoading, setLoading] = useState(false)
    const [dropDown, setDropDown] = useState(false)
    const [type, setType] = useState("")
    const [availablePool, setAvailablePool] = useState([{ exchange: '', token: "", symbol: '' }])



    const swap = async () => {
        if (fromValue == "" || toValue == "") {
            toast.error("feilds are empty")
        } else {
            if (fromToken.symbol == "MATIC") {
                try {
                    const contract = new ethers.Contract(toToken.exchange, exchangeAbi.abi, sdk?.getSigner())
                    const block = await sdk?.getProvider().getBlock(sdk.getProvider().getBlockNumber())
                    var timeStamp = block?.timestamp
                    if (timeStamp != undefined) {

                        await contract.ethToTokenSwapInput(toValue, timeStamp + 1000, { value: parseEther(fromValue) })
                    }
                    toast.success("swaped successfuly")
                } catch (err) { toast.error("found error while swaping") }
            }
            else {
                try {
                    const fromContract = new ethers.Contract(fromToken.exchange, exchangeAbi.abi, sdk?.getSigner())
                    const block = await sdk?.getProvider().getBlock(sdk.getProvider().getBlockNumber())
                    var timeStamp = block?.timestamp
                    if (timeStamp != undefined) {
                        await fromContract.tokenToTokenSwapInput(fromValue, 1, 1, timeStamp + 10000)
                    }


                } catch (err) { toast.error("found error while swaping ") }
            }
        }
    }



    useEffect(() => {

        const call = async () => {
            setLoading(true)
            availablePool.push({ exchange: "", token: "", symbol: "MATIC" })
            var i = 1;
            while (true) {
                const exchange = await factoryContract.getExchangeFromID(i)
                const token = await factoryContract.getTokenFromID(i)
                if (exchange == "0x0000000000000000000000000000000000000000") break;
                else {

                    const contract = new ethers.Contract(token, tokenContractAbi.abi, sdk?.getProvider())
                    const symbol = await contract.symbol()

                    const data = {
                        exchange: exchange,
                        token: token,
                        symbol: symbol
                    }


                    availablePool.push(data)

                }
                i++

            }

            setToToken(availablePool[3])
            setFromToken(availablePool[1])
            setLoading(false)

        }
        call()


    }, [])

    const onFromChange = async (e: any) => {
        if (isLoading) toast.warn("fetching the exchange available")
        else {

            setFromValue(e.target.value)
            if (fromToken?.symbol == "MATIC") {
                const contract = new ethers.Contract(toToken.exchange, exchangeAbi.abi, sdk?.getProvider())
                try {
                    const toTokenGot = await contract.getEthToTokenInputPrice(fromValue)
                    setToValue(toTokenGot)
                } catch (err) {
                    toast.error("Failed to fetching the exchange rate ! there would be no liquidity in exchange")
                }

            }

            else if (fromToken?.symbol == toToken?.symbol) {
                toast.warning("Choose different token to swap")
            }
            else {
                // here we have to perform token -> eth and then eth -> token 
                const fromContract = new ethers.Contract(fromToken.exchange, exchangeAbi.abi, sdk?.getProvider())
                const toContract = new ethers.Contract(toToken.exchange, exchangeAbi.abi, sdk?.getProvider())
                try {
                    const ethBought = await fromContract.getTokenToEthInputPrice(fromValue)
                    try {
                        const toTokenGot = await toContract.getEthToTokenInputPrice(ethBought)
                        setToToken(toTokenGot)
                    } catch (err) {

                        toast.error("Failed to fetching the exchange rate ! there would be no liquidity in exchange")
                    }
                } catch (err) {
                    toast.error("Failed to fetching the exchange rate ! there would be no liquidity in exchange")
                }

            }
        }

    }







    return (
        <>
            <div className="flex flex-col bg-[#0D111C] border-[1px] border-[#56565677] mt-12 rounded-2xl">
                <div className="mx-3 my-4">
                    <p className="text-white font-inter font-medium text-base mb-2">Swap</p>
                    <div className="bg-[#131A2A]  rounded-xl">
                        <div className="flex flex-col px-3 py-4">
                            <div className="flex flex-row items-center ">
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={fromValue}
                                    onChange={(e) => onFromChange(e)}
                                    className="input flex-1 text-3xl text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                />
                                <button className="flex   flex-row text-white  items-center px-[4px] py-[1px] bg-[#323B52] rounded-2xl mr-2 " onClick={() => { setDropDown(true); setType("from") }}>
                                    <img src={polygon} alt="logo" className=" h-4 w-4 mr-1 " />
                                    <p className=" font-inter font-[545] text-white mr-1" >{isLoading ? "MATIC" : fromToken.symbol}</p>
                                    <FiChevronDown />
                                </button>



                            </div>
                        </div>
                    </div>

                    <div className="bg-[#131A2A]  mt-1   rounded-xl">
                        <div className="flex flex-col px-3 py-4 ">
                            <div className="flex flex-row items-center ">
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={toValue}
                                    onChange={(e) => { setToValue(e.target.value) }}
                                    className="input  flex-1 text-3xl text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                />
                                <button className="flex flex-row text-white  items-center px-[4px] py-[1px] bg-[#323B52] rounded-2xl mr-2 " onClick={() => { setDropDown(true); setType("to") }}   >
                                    <img src={polygon} alt="logo" className=" h-4 w-4 mr-1 " />
                                    <p className=" font-inter font-[545] text-white mr-1" >{isLoading ? "loading..." : toToken?.symbol}</p>
                                    <FiChevronDown />
                                </button>

                            </div>
                        </div>
                    </div>





                    <div className="flex flex-1 bg-[#4C82FB] items-center mt-1 justify-center rounded-2xl " >
                        <button className="flex flex-1 items-center justify-center font-inter text-xl text-white font-[600] py-3 " onClick={swap} >
                            Swap
                        </button>
                    </div>
                </div>
            </div>

            {dropDown && <div className='bg-[#0D111C] border-[1px] border-[#56565677] w-1/2 h-3/4 absolute rounded-3xl ' >
                <div className='flex flex-col flex-1 px-8 py-6' >
                    <div className='flex flex-row justify-between ' >
                        <div className='text-white font-bold' >{type.toUpperCase() + " TOKEN"}</div>
                        <AiOutlineClose className='text-white' onClick={() => setDropDown(false)} />
                    </div>


                    {isLoading ? <>
                        <div className='justify-self-center self-center mt-44 '  ><ThreeDots width="50" height="50" color='#4C82FB' radius="8" /></div>
                    </> : <>
                        <div className='overflow-auto h-[450px] mt-4 mb-4' >

                            {availablePool.map((pool, index) => (index != 0 && index % 2 == 0 && <div className="bg-[#131A2A]  rounded-xl mb-4" key={index} >
                                <div className="flex flex-col px-3 py-4">
                                    <button className="flex flex-row items-center justify-center " onClick={() => {
                                        if (type == "from") setFromToken(pool)
                                        else setToToken(pool)

                                        setDropDown(false)
                                    }} >
                                        <div className='text-white font-bold ' >
                                            {pool.symbol}
                                        </div>
                                    </button>

                                </div>
                            </div>))}
                        </div>
                    </>}
                </div>

            </div >}

            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    )
}

export default Swap