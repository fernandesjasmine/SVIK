// src/components/Breadcrumb.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  // Split pathname and filter empty segments
  let pathnames = location.pathname.split('/').filter(x => x);

  // If the last segment is a numeric ID, drop it
  if (pathnames.length > 1 && /^\d+$/.test(pathnames[pathnames.length - 1])) {
    pathnames = pathnames.slice(0, -1);
  }

  const handleClick = (index) => {
    const to = '/' + pathnames.slice(0, index + 1).join('/');
    navigate(to);
  };

  const formatName = (name) => {
    const cleaned = name.replace(/master/i, '').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  return (
    <ol className="flex flex-wrap items-center space-x-1 text-gray-500 text-sm font-bold">
      <li
        className="cursor-pointer hover:underline text-emerald-700"
        onClick={() => navigate('/dashboard')}
      >
        Home
      </li>
      {pathnames.map((name, index) => {
        const isLast = index === pathnames.length - 1;
        return (
          <React.Fragment key={index}>
            <span>/</span>
            <li
              className={`${isLast ? 'font-medium text-gray-800' : 'cursor-pointer hover:underline text-emerald-700'}`}
              {...(!isLast && { onClick: () => handleClick(index) })}
            >
              {formatName(name)}
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}
