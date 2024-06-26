import React from 'react';

import Container from '@/MainPage/Container';

const useConditionalRendering = (
  title,
  description,
  nodatamessage,
  companyId,
  loading,
  data
) => {
  return React.useMemo(() => {
    if (!companyId) {
      return <Container title={title}></Container>;
    }

    if (loading) {
      return (
        <Container title={title}>
          <p>Loading...</p>
        </Container>
      );
    }

    if (!data && !loading) {
      return (
        <Container title={title}>
          <p className="description">{description}</p>
          <p className="message">{nodatamessage}</p>
        </Container>
      );
    }

    return null;
  }, [title, description, nodatamessage, companyId, loading, data]);
};

export default useConditionalRendering;
