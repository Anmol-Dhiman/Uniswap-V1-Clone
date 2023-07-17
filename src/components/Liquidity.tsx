import { useSDK } from '@thirdweb-dev/react'
import { useState, useEffect } from 'react'
import { abi } from "../abi/Factory.json";
import exchangeAbi from "../abi/Exchange.json"
import tokenContractAbi from "../abi/ERC20.json";
import { ToastContainer, toast } from 'react-toastify';
import erc20Abi from "../abi/ERC20.json"
import { AiOutlineClose } from "react-icons/ai"
import { ethers } from 'ethers';
import { ThreeDots } from 'react-loader-spinner'
import { parseEther } from 'ethers/lib/utils';


const Liquidity = () => {
    const factoryContractAddress = import.meta.env.VITE_FACTORY_CONTRACT
    const sdk = useSDK()
    const factoryContract = new ethers.Contract(`${factoryContractAddress}`, abi, sdk?.getProvider())
    const [selectedFeature, setSelectedFeature] = useState("add")
    const [minLiquidy, setMinLiquidity] = useState("")
    const [maxTokens, setMaxTokens] = useState("")
    const [deadline, setDeadline] = useState("")
    const [amount, setAmount] = useState("")
    const [minEth, setMinEth] = useState("")
    const [minTokens, setMinTokens] = useState("")
    const [removingDeadline, setRemovingDeadline] = useState("")
    const [approveAmount, setApproveAmount] = useState("")
    const [maticValue, setMaticValue] = useState("")

    const [selectedExchange, setSelectedExchange] = useState(0)


    const [availablePool, setAvailablePool] = useState([{ exchange: "", token: "", symbol: "" }])

    const [isLoading, setLoading] = useState(false)

    const [dropDown, setDropDown] = useState(false)
    const clearData = () => {
        setMinLiquidity("");
        setMaxTokens("");
        setDeadline("");
        setAmount("");
        setMinEth("");
        setMinTokens("");
        setRemovingDeadline("");
    }




    useEffect(() => {

        const call = async () => {
            setLoading(true)
            var i = 1;
            while (true) {
                console.log("fetching")

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
            setSelectedExchange(1)
            setLoading(false)

        }
        call()


    }, [])









    const addingLiquidity = async () => {

        if (minLiquidy == "" || maxTokens == "" || deadline == "") {
            toast.error("Each field is required")
        }
        else {


            try {
                const contract = new ethers.Contract(availablePool[selectedExchange].exchange, exchangeAbi.abi, sdk?.getSigner())
                const data = await contract.addLiquidity(parseInt(minLiquidy), parseInt(maxTokens), parseInt(deadline), { value: parseEther(maticValue) })

                toast.success("added successfuly")

            } catch (err) {
                toast.error("failed to add liquidity")
            }
        }
    }

    const removingLiquidity = async () => {
        if (amount == "" || minEth == "" || minTokens == "" || removingDeadline == "")
            toast.error("Each field is required")
        else {

            try {
                const contract = new ethers.Contract(availablePool[selectedExchange].exchange, exchangeAbi.abi, sdk?.getSigner())
                await contract.removeLiquidity(parseInt(amount), parseInt(minEth), parseInt(minTokens), parseInt(removingDeadline))
                toast.success("liquidity removed successfuly")
            } catch (err) {
                toast.error("failed to remove liquidity")
            }
        }
    }

    const approveExchange = async () => {
        if (isLoading) {
            toast.warn("fetching the available exchanges")
        }
        else {

            if (approveAmount == "") {
                toast.error("amount is empty")
            } else {
                try {
                    const contract = new ethers.Contract(availablePool[selectedExchange].token, erc20Abi.abi, sdk?.getSigner())
                    const data = await contract.approve(availablePool[selectedExchange].exchange, parseEther(approveAmount))

                    toast.success("approved successfully")
                } catch (err) {
                    toast.error('found revert')
                }
            }
        }
    }

    const liquidity = () => {
        selectedFeature == "add" ? addingLiquidity() : selectedFeature == "remove" ? removingLiquidity() : approveExchange()
    }




    return (
        <>
            <div className="flex flex-col bg-[#0D111C] border-[1px] border-[#56565677] mt-12 rounded-2xl"  >
                <div className="mx-3 my-4">
                    <div className="flex flex-row w-[720px] mb-4 justify-between" >
                        <div>
                            <button className={selectedFeature == "add" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => setSelectedFeature("add")} >Add Liquidity</button>
                            <button className={selectedFeature == "remove" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => setSelectedFeature("remove")} >Remove Liquidity</button>
                            <button className={selectedFeature == "approve" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => setSelectedFeature("approve")} >Approve Exchange</button>
                        </div>
                        <div className='flex flex-row w-fit items-center justify-center ' >
                            <p className=' bg-green-600 w-1 h-1 rounded-full mr-2 mt-1 ' />
                            <button className='text-[#98A1C0] hover:text-white' onClick={clearData}  >clear</button>
                        </div>
                    </div>
                    <div className="bg-[#131A2A]  rounded-xl mb-4">
                        <div className="flex flex-col px-3 py-4">
                            <button className="flex flex-row items-center justify-center " onClick={() => setDropDown(true)} >
                                <div className='text-white font-bold ' >
                                    {isLoading ? "loading..." : `MATIC - ${availablePool[selectedExchange].symbol}`}
                                </div>

                            </button>

                        </div>
                    </div>




                    {selectedFeature == "add" ? <>

                        <div className="bg-[#131A2A]  rounded-xl mb-4">
                            <div className="flex flex-col px-3 py-4">
                                <div className="flex flex-row items-center ">
                                    <input
                                        type="number"
                                        placeholder="Minimum liquidity you want to get"
                                        value={minLiquidy}
                                        onChange={(e) => { setMinLiquidity(e.target.value) }}
                                        className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                    />

                                </div>

                            </div>
                        </div>
                        <div className="bg-[#131A2A]  rounded-xl mb-4">
                            <div className="flex flex-col px-3 py-4">
                                <div className="flex flex-row items-center ">
                                    <input
                                        type="number"
                                        placeholder="Max tokens you wants to provide"
                                        value={maxTokens}
                                        onChange={(e) => { setMaxTokens(e.target.value) }}
                                        className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                    />

                                </div>

                            </div>
                        </div>
                        <div className="bg-[#131A2A]  rounded-xl mb-4">
                            <div className="flex flex-col px-3 py-4">
                                <div className="flex flex-row items-center ">
                                    <input
                                        type="number"
                                        placeholder="Time Deadline in UNIX"
                                        value={deadline}
                                        onChange={(e) => { setDeadline(e.target.value) }}
                                        className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                    />

                                </div>

                            </div>
                        </div>
                        <div className="bg-[#131A2A]  rounded-xl mb-4">
                            <div className="flex flex-col px-3 py-4">
                                <div className="flex flex-row items-center ">
                                    <input
                                        type="number"
                                        placeholder="MATIC"
                                        value={maticValue}
                                        onChange={(e) => { setMaticValue(e.target.value) }}
                                        className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                    />

                                </div>

                            </div>
                        </div>



                    </>


                        : selectedFeature == "remove" ?


                            <>

                                <div className="bg-[#131A2A]  rounded-xl mb-4">
                                    <div className="flex flex-col px-3 py-4">
                                        <div className="flex flex-row items-center ">
                                            <input
                                                type="number"
                                                placeholder="Amount of VARM-V1 tokens you want to liquidate"
                                                value={amount}
                                                onChange={(e) => { setAmount(e.target.value) }}
                                                className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                            />

                                        </div>

                                    </div>
                                </div>
                                <div className="bg-[#131A2A]  rounded-xl mb-4">
                                    <div className="flex flex-col px-3 py-4">
                                        <div className="flex flex-row items-center ">
                                            <input
                                                type="number"
                                                placeholder="Minimum MATIC you want to get back"
                                                value={minEth}
                                                onChange={(e) => { setMinEth(e.target.value) }}
                                                className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                            />

                                        </div>

                                    </div>
                                </div>
                                <div className="bg-[#131A2A]  rounded-xl mb-4">
                                    <div className="flex flex-col px-3 py-4">
                                        <div className="flex flex-row items-center ">
                                            <input
                                                type="number"
                                                placeholder="Minimum tokens you want to get back"
                                                value={minTokens}
                                                onChange={(e) => { setMinTokens(e.target.value) }}
                                                className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                            />

                                        </div>

                                    </div>
                                </div>
                                <div className="bg-[#131A2A]  rounded-xl mb-4">
                                    <div className="flex flex-col px-3 py-4">
                                        <div className="flex flex-row items-center ">
                                            <input
                                                type="number"
                                                placeholder="Time Deadline"
                                                value={removingDeadline}
                                                onChange={(e) => { setRemovingDeadline(e.target.value) }}
                                                className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                            />

                                        </div>

                                    </div>
                                </div>






                            </> : <>

                                <div className="bg-[#131A2A]  rounded-xl mb-4">
                                    <div className="flex flex-col px-3 py-4">
                                        <div className="flex flex-row items-center ">
                                            <input
                                                type="number"
                                                placeholder="Amount of token you wants to provide"
                                                value={approveAmount}
                                                onChange={(e) => { setApproveAmount(e.target.value) }}
                                                className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                            />

                                        </div>

                                    </div>
                                </div>




                            </>}





                    <div className="flex flex-1 bg-[#4C82FB] items-center mt-1 justify-center rounded-2xl " >
                        <button className="flex flex-1 items-center justify-center font-inter text-xl text-white font-[600] py-3 " onClick={liquidity}>
                            {selectedFeature == "add" ? "Add Liquidity" : selectedFeature == "remove" ? "Remove Liquidity" : "Approve Exchange"}
                        </button>
                    </div>
                </div>
            </div >

            {dropDown && <div className='bg-[#0D111C] border-[1px] border-[#56565677] w-1/2 h-3/4 absolute rounded-3xl ' >

                <div className='flex flex-col flex-1 px-8 py-6' >
                    <div className='flex flex-row justify-between ' >
                        <div className='text-white font-bold' >Available Exchanges</div>
                        <AiOutlineClose className='text-white' onClick={() => setDropDown(false)} />
                    </div>

                    {isLoading ? <>
                        <div className='justify-self-center self-center mt-44 '  ><ThreeDots width="50" height="50" color='#4C82FB' radius="8" /></div>
                    </> : <>
                        <div className='overflow-auto h-[450px] mt-4 mb-4' >

                            {availablePool.map((pool, index) => (index != 0 && index % 2 == 0 && <div className="bg-[#131A2A]  rounded-xl mb-4" key={index} >
                                <div className="flex flex-col px-3 py-4">
                                    <button className="flex flex-row items-center justify-center " onClick={() => { setSelectedExchange(index); setDropDown(false); }} >
                                        <div className='text-white font-bold ' >
                                            {pool.symbol}
                                        </div>
                                    </button>

                                </div>
                            </div>))}
                        </div>
                    </>}
                </div>

            </div>}

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

export default Liquidity