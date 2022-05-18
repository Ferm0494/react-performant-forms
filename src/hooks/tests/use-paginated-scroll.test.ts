import {renderHook,act} from "@testing-library/react-hooks";
import usePaginatedScroll from '../usePaginatedScroll'



const MOCK_DATA_1 = {
    id:1
}


const MOCK_ERROR = {error: 'MOCK_MSSG'}
const mockDataResolver = jest.fn(()=>Promise.resolve([MOCK_DATA_1]));
 const mockDataRejection= jest.fn(()=>Promise.reject(MOCK_ERROR))

const getMockedDiv =({scrollTop=450,scrollHeight=900, clientHeight=450})=>({
    current:{
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollTo: jest.fn()
    }
}) as unknown as  React.MutableRefObject<HTMLDivElement>

describe('use-paginated-scroll',()=>{
    beforeEach(()=>{
        mockDataResolver.mockClear();
        mockDataRejection.mockClear()
    })
    it('should render properly with default values',()=>{
    
        const {result} = renderHook(()=>
            usePaginatedScroll({
                getData: mockDataResolver
            })
        )
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toEqual([]);
        expect(result.current.scrollReference.current).toBe(undefined);
        expect(result.current.error).toBe(false);
        expect(mockDataResolver).toHaveBeenCalledTimes(0);
    });

    it('should call getData param if we reach to the bottom of our scroll div element and increase counter',async()=>{
    
        const {result,waitForNextUpdate} = renderHook(()=>usePaginatedScroll({
            getData:mockDataResolver
        }));
        const mockedDiv = getMockedDiv({});
        result.current.scrollReference.current = mockedDiv.current

       act(()=>{
           result.current.onScroll();
        });
        expect(result.current.loading).toBe(true);
        expect(mockDataResolver).toHaveBeenCalledTimes(1);
        await waitForNextUpdate();
        expect(result.current.counter).toEqual(2);
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toEqual([MOCK_DATA_1])

    });

    it('should not call getData param if we not reach our bottom of our scroll div element, counter should not increase',()=>{
        const {result} = renderHook(()=>usePaginatedScroll({
            getData: mockDataResolver
        }));

        const mockedDiv = getMockedDiv({
            scrollHeight: 1200
        });
        result.current.scrollReference.current = mockedDiv.current
        act(()=>{
            result.current.onScroll();
        });
        expect(result.current.loading).toBe(false);
        expect(mockDataResolver).toHaveBeenCalledTimes(0)
    });

it('should not increase counter if request failed within our getData param, and we hit bottom through our scrollable div element, with default offset top on scrollable',async()=>{
    const {result,waitForNextUpdate} = renderHook(()=>usePaginatedScroll({
        getData: mockDataRejection
    }));

    const mockedDiv = getMockedDiv({});
    result.current.scrollReference.current = mockedDiv.current;
    act(()=>{
        result.current.onScroll()
    });

    expect(result.current.loading).toBe(true);
    expect(mockDataRejection).toHaveBeenCalledTimes(1);
    expect(result.current.counter).toEqual(1)
    await waitForNextUpdate();
    expect(result.current.counter).toEqual(1);
    expect(result.current.error).toEqual(MOCK_ERROR);
    expect(result.current.loading).toEqual(false)
    expect(mockedDiv.current.scrollTo).toHaveBeenCalledWith({
        top: mockedDiv.current.scrollTop  - mockedDiv.current.scrollTop * 0.1,
        behavior: "smooth"
    })

});

});
