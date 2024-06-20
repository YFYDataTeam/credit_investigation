import { useEffect, useState } from "react";

const useAuthCheck = () => {
  const [isValid, setIsValid] = useState(false);
  const end_point = "https://yfy.ideaxpress.biz/api";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiYjViOWIxYy05YmNjLTQwZWYtODViNS04Mzc2MWU2OWYwYjYiLCJpYXQiOjE3MTg4NjA4MzUsImV4cCI6MTcxODk0NzIzNX0.pG1mgcmL2Kx2LWUopwze7DTnIhM8cECxfxVAaCsI8Go";
  const companyCategoryUuid = "266db9b5-62c7-4e58-8e20-26d8d582a4f1";

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const url = `${end_point}/auth/categorySetting/${companyCategoryUuid}`;
        console.log("url:", url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          const data = await response.json();
          if (data && data.data && data.data.length > 0) {
            const category = data.data[0];
            const currentDate = new Date();
            const startDate = new Date(category.startDate);
            const endDate = new Date(category.endDate);
            console.log("current date:", category);
            if (
              category.isEnable &&
              category.service === "ESG新聞" &&
              currentDate >= startDate &&
              currentDate <= endDate
            ) {
              setIsValid(true);
            } else {
              setIsValid(false);
            }
          } else {
            setIsValid(false);
          }
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsValid(false);
      }
    };

    fetchToken();
  }, []);

  return isValid;
};

export default useAuthCheck;
