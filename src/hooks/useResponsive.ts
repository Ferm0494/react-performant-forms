import {useState,useEffect} from 'react'
/** 
* Keep screen dimensions within one hook
* @param {boolean} resizeListener - If true evertime useResponsive its going to be measuring the screen width, to set dimension values, Default value is *true*
* @param {breakingPoints} breakingPoints - NOT RECOMMENDED: But you can set your own limits for each dimension.
*/
const useResponsive = (resizeListener= true, breakingPoints = { sm :576, md:768, lg:992, xl:1200 })=>{
    const {sm,md,lg,xl} = breakingPoints;
    const [width,setWidth]= useState({
        xs: window.innerWidth < sm,
        sm: window.innerWidth < md && window.innerWidth >= sm,
        md: window.innerWidth < lg && window.innerWidth >= md,
        lg: window.innerWidth < xl && window.innerWidth >= lg,
        xl: window.innerWidth >= xl     
    });

    useEffect(()=>{
           const handleResize = ()=>{
               console.log('Resizing!')
            setWidth({
                xs: window.innerWidth < sm,
                sm: window.innerWidth < md && window.innerWidth >= sm,
                md: window.innerWidth < lg && window.innerWidth >= md,
                lg: window.innerWidth < xl && window.innerWidth >= lg,
                xl: window.innerWidth >= xl       
            });
           }
           if(resizeListener){
            window.addEventListener("resize",handleResize);
           }
           return ()=> {
               if(resizeListener){
                return window.removeEventListener("resize",handleResize)
               }
           };
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