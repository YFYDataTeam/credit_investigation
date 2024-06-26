import { useEffect, useState } from 'react';

const useFetchData = (apiUrl, companyId) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (companyId !== '') {
        try {
          setLoading(true);
          const response = await fetch(apiUrl);

          if (!response.ok) {
            throw new Error('Error fetching data');
          }

          const data = await response.json();
          if (data.message === 'NoData') {
            setData(null);
          } else {
            setData(data);
            setLoading(false);
          }
        } catch (err) {
          console.error('Error:', err);
          setError(err);
          setLoading(false);
        } finally {
          setLoading(false);
        }
      } else {
        try {
          await fetch(`${endPoint}reset_company_id`);
        } catch (err) {
          console.error('Error:', err);
          setError(err);
        }
      }
    };

    fetchData();
  }, [apiUrl, companyId]);

  return { loading, data };
};

export default useFetchData;
