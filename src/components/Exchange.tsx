import { useContract, useContractWrite, useContractRead, useSDK } from '@thirdweb-dev/react'
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils'
import { useState } from 'react'
import { abi } from "../abi/Factory.json"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Exchange = () => {
    const factoryContractAddress = import.meta.env.VITE_FACTORY_CONTRACT
    const sdk = useSDK()
    const [selectedFeature, setSelectedFeature] = useState("create")
    const [value, setValue] = useState("")
    const { contract } = useContract(`${factoryContractAddress}`);

    const { mutateAsync: createExchange, status, error } = useContractWrite(
        contract,
        "createExchange",
    );

    const { data: token } = useContractRead(contract, `${value == "" ? "getTokenFromID" : isAddress(value) ? "getTokenFromExchange" : "getTokenFromID"}`, [value])
    const { data: exchange } = useContractRead(contract, `${value == "" ? "getExchangeFromID" : isAddress(value) ? "getExchangeFromToken" : "getExchangeFromID"}`, [value])

    const valueError = () => {
        toast.error('Empty value detected');
    }
    const creatingExchange = () => {
        toast.info('Creating Exchange');
    }

    const exchangeCreationSuccess = () => {
        toast.success("Exchange Created Successfully")
    }
    const exchangeCreationFailed = () => {
        toast.error("Failed to create exchange")
    }

    const addressToast = (message: string) => {
        toast.success(message)
    }
    const exchangeFeatures = () => {
        switch (selectedFeature) {
            case "create": {

                if (value == "") valueError()
                else {
                    const call = async () => {
                        creatingExchange()
                        const contract = new ethers.Contract(`${factoryContractAddress}`, abi, sdk?.getSigner())
                        await contract.createExchange(value)

                        if (error) {

                            exchangeCreationFailed()
                        }
                        else {

                            if (status == "error") {
                                exchangeCreationFailed()
                            }
                            else {
                                exchangeCreationSuccess()
                            }
                        }
                    }
                    call()
                }
                break;
            }

            case "token": {

                if (value == "") valueError()
                else addressToast(`Token Address - ${token}`)


                break;
            }

            case "exc": {


                if (value == "") valueError()
                else addressToast(`Exchange Address - ${exchange}`)

                break;
            }
        }
    }

    return (
        <>
            <div className="flex flex-col bg-[#0D111C] border-[1px] border-[#56565677] mt-12 rounded-2xl">
                <div className="mx-3 my-8">
                    <div className="flex flex-row w-[520px] mb-4 " >
                        <button className={selectedFeature == "create" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => { setSelectedFeature("create"); setValue("") }} >Create Exchange</button>
                        <button className={selectedFeature == "token" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => { setSelectedFeature("token"); setValue("") }} >About Token</button>
                        <button className={selectedFeature == "exc" ? "feature-button text-white" : "feature-button text-[#98A1C0]"} onClick={() => { setSelectedFeature("exc"); setValue("") }} >About Exchange</button>
                    </div>


                    <div className="bg-[#131A2A]  rounded-xl mb-4 ">
                        <div className="flex flex-col px-3 py-4">
                            <div className="flex flex-row items-center ">
                                <input
                                    type="text"
                                    placeholder={selectedFeature == "create" ? "Give Token Address" : selectedFeature == "token" ? "Give Exchange Address or Exhcange ID" : "Give Token Address or Exchange ID"}
                                    value={value}
                                    onChange={(e) => { setValue(e.target.value) }}
                                    className="input flex-1 text-lg text-white mr-2  font-inter placeholder:text-[#929BB9] outline-none bg-transparent"
                                />
                            </div>

                        </div>
                    </div>



                    <div className="flex flex-1 bg-[#4C82FB] items-center mt-1 justify-center rounded-2xl " >
                        <button className="flex flex-1 items-center justify-center font-inter text-xl text-white font-[600] py-3" onClick={exchangeFeatures}  >
                            {
                                selectedFeature == "create" ? "Create" : selectedFeature == "token" ? "Get Token Address" : "Get Exchange Address"
                            }
                        </button>
                    </div>
                </div>

            </div>
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

export default Exchange