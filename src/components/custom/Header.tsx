import React from "react";
import { Button } from "../ui/button";


const Header = () => {
  return (
    <div className="w-full h-16 flex justify-between items-center p-4 z-10 absolute">
      <div className={`font-bold text-2xl text-white `}>aniMate</div>
          <div className="flex gap-3">
              <Button variant={'ghost'}>Sign up</Button>
              <Button variant={"secondary"}>Log in</Button>
      </div>
    </div>
  );
};

export default Header;
