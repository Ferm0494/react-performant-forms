import {useState,useEffect} from 'react'

interface BreakingPoints{
    xs?:number,
    sm?: number,
    md?: number,
    lg?:number,
    xl?:number,

}

const useResponsive = ({
    sm=576,
    md=768,
    lg=992,
    xl=1200

}: BreakingPoints)=>{

    const [width,setWidth]= useState({
        xs: window.innerWidth < sm,
        sm: window.innerWidth < md && window.innerWidth >= sm,
        md: window.innerWidth < lg && window.innerWidth >= md,
        lg: window.innerWidth < xl && window.innerWidth >= lg,
        xl: window.innerWidth >= xl     
    });

    useEffect(()=>{
           const handleResize = ()=>{
            setWidth({
                xs: window.innerWidth < sm,
                sm: window.innerWidth < md && window.innerWidth >= sm,
                md: window.innerWidth < lg && window.innerWidth >= md,
                lg: window.innerWidth < xl && window.innerWidth >= lg,
                xl: window.innerWidth >= xl       
            });
           }

           window.addEventListener("resize",handleResize);
           handleResize();
           return ()=> window.removeEventListener("resize",handleResize);
    },[])

    return{
        xs: width.xs,
        sm: width.sm,
        md: width.md,
        lg: width.lg,
        xl: width.xl
    }
};

export default useResponsive;