import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../store/store";

const Editor3 = () => {
  const { filetabItems, cursor, aktifTabItem, startDir } = useAppSelector(
    (store) => store.filetabs
  );
  const { finalCode, endPos, startPos, codeMessages } = useAppSelector(
    (store) => store.openai
  );
  const [coba, setCoba] = useState("first");

  const isFirstRender = useRef(true);

  

  useEffect(() => {
    console.log("aktifTabItem.code changed", isFirstRender.current);
  }, [aktifTabItem.code]);

  useEffect(() => {
    console.log("codeMessages changed", isFirstRender.current);
  }, [codeMessages]);

  useEffect(() => {
    console.log("startDir changed", isFirstRender.current);
  }, [startDir]);

  console.log(" isFirstRender.current: ", isFirstRender.current);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  }, []);

  return <div>{coba}</div>;
};

export default Editor3;
