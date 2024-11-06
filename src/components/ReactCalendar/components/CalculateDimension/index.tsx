export const calculateDimensions = ({
  divRef,
  duration,
}: {
  divRef: string;
  duration: number;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const divObj = document.getElementById(divRef);
      if (!divObj) {
        resolve({ width: 540, height: 195 });
      } else {
        const { width, height } = divObj.getBoundingClientRect();
        resolve({ width, height });
      }
    }, duration);
  });
};
