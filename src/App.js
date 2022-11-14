
import 'normalize.css';
import './App.css';

import { useState, useEffect } from 'react';

import ArticleTitle from './components/Article/ArticleTitle';
import ArticleDate from './components/Article/ArticleDate';
import ArticleBanner from './components/Article/ArticleBanner';
import ArticleBlob from './components/Article/ArticleBlob';

import endpoints from './constants/endpoints.json';
import TabulatedData from './components/TabulatedData';

function App() {
  let fetches = 0;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      if (fetches) {
        return;
      }
      else {
        fetches++;
      }
      fetch(endpoints.datausa_wages)
          .then((res) => res.json())
          .then((data) => {
              setData(data.data);
              setLoading(false);
          })
          .catch((err) => {
            console.log(err);
              setError(true);
              setLoading(false);
          })
  }, []);

  return (
    <div className="App">
      <main>
        <ArticleTitle title="Average Wage by Occupation in the United States (2014 – 2020)" />
        <ArticleDate date="November 14, 2022" />
        <ArticleBanner src={endpoints.article_banner} />
        <ArticleBlob content="The average wage for an occupation is the average wage for all workers in that occupation. The average wage is calculated by dividing the total wages paid to all workers in an occupation by the total number of workers in that occupation. The average wage is not the same as the median wage, which is the wage at the midpoint of the wage distribution for an occupation. The average wage is also not the same as the mean wage, which is the average of all wages in an occupation." />
        <TabulatedData dataRaw={data} loading={loading} error={error} />
      </main>
      <footer>
        <p>
          <span>Created by <a href="https://github.com/omargfh" target="_blank" rel="noreferrer">Omar Ibrahim</a></span>
          {'-'}
          <span>Data provided by <a href="https://datausa.io" target="_blank" rel="noreferrer">Data USA Public API</a></span>
        </p>
      </footer>
    </div>
  );
}
export default App;
