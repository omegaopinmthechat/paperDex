import app from './app.js';
import env from './config/env.js';

app.listen(5000, () => {
  console.log(`Server running on port ${env.PORT}`);
});
