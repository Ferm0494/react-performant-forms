import { useState, useRef} from "react";

type Threshold =
  | 0.1
  | 0.15
  | 0.2
  | 0.25
  | 0.3
  | 0.35
  | 0.4
  | 0.45
  | 0.5
  | 0.55
  | 0.6
  | 0.65
  | 0.7
  | 0.75
  | 0.8
  | 0.85
  | 0.9
  | 0.95
  | 1;

interface IProps {
  initialCounter?: number;
  getData: () => Promise<unknown[]>;
  initialData?: unknown[];
  offSet?: Threshold;
}

const usePaginatedScroll = ({
  initialData,
  initialCounter = 1,
  getData,
  offSet = 0.1
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [counter, setCounter] = useState(initialCounter);
  const [data, setData] = useState(initialData || []);
  const [error, setError] = useState<boolean>(false);
  const scrollContainer = useRef<
    HTMLDivElement
  >();

  const onScroll = () => {
    if (scrollContainer.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer.current;
      if (
        scrollTop + clientHeight === scrollHeight &&
        !loading
      ) {
        setLoading(true);
        getData()
        .then((newData) => {
          setError(false)
          setData([...data, ...newData]);
          setCounter(counter + 1);
          setLoading(false);
        })
        .catch((error) => {
          setError(error);
          setLoading(false);
          if (scrollContainer.current?.scrollTo) {
            scrollContainer.current.scrollTo({
              top: scrollTop - scrollTop * offSet,
              behavior: "smooth"
            });
          }
        });
      }
    }
  };

  return {
    loading,
    counter,
    data,
    onScroll,
    error,
    scrollReference: scrollContainer
  };
};

export default usePaginatedScroll;
