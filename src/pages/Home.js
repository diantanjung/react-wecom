import React, { useState, useEffect } from 'react';
import axiosInstance from "../helpers/axiosInstance";
import Xterm from "../components/Xterm";

export default function Home(props) {
  let home;
  if (props.username === ''){
    home = (
      <div className="text-center">You are not loged in.</div>
      );
  }else{
    home = (
      <div>
       <Xterm />
      </div>
    );
  }

  return (
    home
  );
}