import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="wrap section center"><h1>404</h1><p>This page took a wrong turn.</p><Link to="/" className="btn">Back home</Link></div>;
}
