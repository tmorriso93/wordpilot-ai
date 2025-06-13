import Image from "next/image";
import HeroImage from '../public/bg-img-005.jpg'
import { Logo } from "../components/Logo";
import Link from "next/link";


export default function Home() {
  


  return ( 
   <div className="w-screen h-screen flex justify-center items-center relative">
        {/* Background Image for the Hero Section */}
        {/* Homepage */}
      <Image src={HeroImage} alt="Hero" fill className="absolute" />
      <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-[4px] ">
        {/* Import the Logo component */}
        <Logo />
        <p>
        Say goodbye to writer’s block — WordPilot AI is your smart writing assistant, ready to turn your ideas into beautifully written blog posts in just a few clicks.
        </p>
        <Link href='/post/new' className="btn">Begin</Link>
      </div>
    </div>
  )
}
