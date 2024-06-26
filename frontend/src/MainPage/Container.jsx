import { forwardRef } from 'react';

import '../../assets/css/container.css';

const Container = forwardRef(({ title, children }, ref) => {
  return (
    <div className="container" ref={ref}>
      <div className="section">
        <h2 className="section-title">{title}</h2>
        <div className="section-content">{children}</div>
      </div>
    </div>
  );
});

export default Container;
