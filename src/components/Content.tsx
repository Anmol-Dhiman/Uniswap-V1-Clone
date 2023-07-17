
import { BsTwitter, BsGithub, BsDiscord } from 'react-icons/bs';

import icon from "../assets/middle-icon.svg"
import urls from '../constants/urls';

const Content = () => {
    return (
        <div className='mb-28 ml-[82px]'>
            <div className="flex flex-row  items-end mb-6">
                <p className="text-white font-thin text-6xl">SHERLOCK SWAP</p>
                <img src={icon} alt="Middle Icon" className="mb-8 hover:rotate-[-15deg] transition-transform duration-500 ease-in-out " />
                <p className="text-white font-semibol text-6xl" >PROTOCOL</p>
            </div>
            <p className='text-white font-normal w-[45rem] text-2xl mb-6'>Swap, earn, and build on the leading decentralized crypto trading protocol.</p>
            <div className="flex flex-row items-center">
                <a className="social-button" href={urls.twitter} target='_blank' ><BsTwitter /></a>
                <a className="social-button" href={urls.github} target='_blank'><BsGithub /></a>
                <a className="social-button" href={urls.discord}  ><BsDiscord /></a>
            </div>
        </div>
    )
}

export default Content