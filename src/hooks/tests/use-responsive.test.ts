import useResponsive from '../useResponsive'
import {renderHook,act} from '@testing-library/react-hooks'
import { fireEvent } from '@testing-library/react';


describe('useResponsive',()=>{
   describe("default values",()=>{
    it('should render proper values for XL width',()=>{
        window.innerWidth = 1200;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: true,
            lg: false,
            md: false,
            sm: false,
            xs: false
        })
    });

    it('should render proper values for XL limit(1200)',()=>{
       window.innerWidth = 1200 
       const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: true,
            lg: false,
            md: false,
            sm: false,
            xs: false
        })

    });

    it('should render proper values for LG width',()=>{
        window.innerWidth = 993;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: false,
            lg: true,
            md: false,
            sm: false,
            xs: false
        })

    });
    it('should render proper values for LG  limit width(992)',()=>{
        window.innerWidth = 992;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: false,
            lg: true,
            md: false,
            sm: false,
            xs: false
        })

    });

    it('should render proper values for MD width',()=>{
        window.innerWidth = 769;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: false,
            lg: false,
            md: true,
            sm: false,
            xs: false
        })
    });

    it('should render proper values for MD width',()=>{
        window.innerWidth = 769;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: false,
            lg: false,
            md: true,
            sm: false,
            xs: false
        })
    });

    it('should render proper values for MD limit width (768)',()=>{
        window.innerWidth = 768;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: false,
            lg: false,
            md: true,
            sm: false,
            xs: false
        })
    });
    it('should render proper values for SM width',()=>{
        window.innerWidth = 577;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: false,
            lg: false,
            md: false,
            sm: true,
            xs: false
        })
    });

    it('should render proper values for SM limit width(576)',()=>{
        window.innerWidth = 576;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: false,
            lg: false,
            md: false,
            sm: true,
            xs: false
        })
    });
    it('should render proper values XS)',()=>{
        window.innerWidth = 575;
        const {result} = renderHook(()=> useResponsive());
        expect(result.current).toEqual({
            xl: false,
            lg: false,
            md: false,
            sm: false,
            xs: true
        })
    });
   });

   describe.skip('resizeListener',()=>{
       it.skip('should not modify  initial values if listener is off(false) & screen is resized',async()=>{
           window.innerWidth = 1400;
           jest.useFakeTimers();
           const {result} = renderHook(()=>useResponsive(false));
           expect(result.current).toEqual({
            xl: true,
            lg: false,
            md: false,
            sm: false,
            xs: false
        });
         act(()=>{
            window.resizeTo(800,800)
            fireEvent(window, new Event("resize"))
        })
        jest.advanceTimersByTime(251)
           expect(result.current).toEqual({
            xl: false,
            lg: false,
            md: true,
            sm: false,
            xs: false
        });
         
        });
        

        it.skip('should modify initial values if listener is on(true) & screen is resized',()=>{
            window.innerWidth = 1400;
            jest.useFakeTimers();
            const {result} = renderHook(()=>useResponsive());
            expect(result.current).toEqual({
                xl: true,
                lg: false,
                md: false,
                sm: false,
                xs: false
            });
             act(()=>{
                window.resizeTo(800,800)
                fireEvent(window, new Event("resize"))
            })
            jest.advanceTimersByTime(251)
            expect(result.current).toEqual({
            xl: false,
            lg: false,
            md: true,
            sm: false,
            xs: false
        });

        });
   })

})