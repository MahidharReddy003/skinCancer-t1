import { Link } from "react-router-dom";
import { Card } from "../components/ui";
import { CLASS_LABELS, metrics } from "../data/metrics";

export function HowItWorks() {
  return (
    <div className="page stack">
      <h1>How it works</h1>
      <p className="muted">What happens between choosing an image and seeing a result, as implemented in this project.</p>
      <Card>
        <ol className="stack">
          <li><strong>You choose an image.</strong> Your browser checks that it is a JPEG, PNG or WebP file of 10 MB or less.</li>
          <li><strong>The server validates it.</strong> The API repeats those checks, confirms the file is a real image, and converts it to RGB.</li>
          <li><strong>The image is prepared.</strong> It is resized to 224 × 224 pixels (without cropping, so the aspect ratio can change) and normalized with the standard ImageNet values.</li>
          <li><strong>The model scores it.</strong> An EfficientNet-B0 network, started from ImageNet weights and fine-tuned on the HAM10000 training split, produces one probability for each of seven classes.</li>
          <li><strong>You see the probabilities.</strong> The class with the highest probability is shown first, together with all the others.</li>
        </ol>
      </Card>
      <Card>
        <h2>The seven classes</h2>
        <ul className="stack">
          {metrics.class_order.map((c) => <li key={c}><strong>{c}</strong> <span className="muted">{CLASS_LABELS[c]}</span></li>)}
        </ul>
      </Card>
      <Card>
        <h2>How it was trained</h2>
        <p>Training ran for 5 epochs with a class-weighted loss to offset imbalance. The saved checkpoint is the one with the best macro F1 on the validation set; the test set was not used to choose it. Images of the same lesion were kept in the same split.</p>
        <p className="muted" style={{ margin: 0 }}>See <Link to="/model-performance">Model performance</Link> for measured results and their limits.</p>
      </Card>
    </div>
  );
}

export function About() {
  return (
    <div className="page stack">
      <h1>About and limitations</h1>
      <p className="muted">DermaVision AI is an educational project that explores dermoscopic image classification. It is not a medical product.</p>
      <Card>
        <h2>What it is built with</h2>
        <p style={{ margin: 0 }}>A PyTorch EfficientNet-B0 model trained on the public HAM10000 dataset, served by a FastAPI backend, with a React and TypeScript front end.</p>
      </Card>
      <Card>
        <h2>Limitations to keep in mind</h2>
        <ul className="stack">
          <li><strong>Not clinically validated.</strong> No clinician has evaluated this model, and it has not been tested for real-world use.</li>
          <li><strong>It cannot rule out cancer.</strong> A low probability for any class is not reassurance, and a high one is not a diagnosis.</li>
          <li><strong>Narrow training data.</strong> HAM10000 contains dermoscopic images from a limited set of sources. Phone photos and other imaging conditions are not represented.</li>
          <li><strong>Imbalanced classes.</strong> Most training images are nevi, and some classes have very few examples, so results for those are less reliable.</li>
          <li><strong>Lesion-level split only.</strong> Images of one lesion never cross between training and test data, but patient-level separation was not possible because the data has no patient IDs.</li>
        </ul>
      </Card>
      <Card>
        <h2>If a lesion concerns you</h2>
        <p style={{ margin: 0 }}>See a qualified healthcare professional, especially for a spot that is new, changing, bleeding or different from your others. This app cannot replace that assessment.</p>
      </Card>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="page stack">
      <h1>Privacy</h1>
      <p className="muted">What this version of the app does with your data. It will be updated if that changes.</p>
      <Card>
        <h2>Images</h2>
        <ul className="stack">
          <li>When you select Analyze image, the file is sent to the API address shown on the analysis page. In a local setup that is your own computer.</li>
          <li>This app does not save your image or the result, and the backend code does not write uploads to storage or log their contents.</li>
          <li>The web server software may use a temporary file for large uploads and removes it afterwards.</li>
        </ul>
      </Card>
      <Card>
        <h2>Accounts and tracking</h2>
        <ul className="stack">
          <li>There are no accounts, saved history, analytics or advertising in this version.</li>
          <li>Your browser stores one preference, your light or dark theme, on your device.</li>
          <li>Downloaded reports are created in your browser and go nowhere else.</li>
        </ul>
      </Card>
      <Card>
        <h2>Not covered</h2>
        <p style={{ margin: 0 }}>This project makes no claim of compliance with medical-data regulations. Don't upload images you aren't comfortable processing on the server you are connected to.</p>
      </Card>
    </div>
  );
}

export function Help() {
  return (
    <div className="page stack">
      <h1>Help</h1>
      <Card>
        <h2>What to upload</h2>
        <ul className="stack">
          <li>A single dermoscopic image of one lesion, as JPEG, PNG or WebP, up to 10 MB.</li>
          <li>The model was trained on dermoscopy images. Ordinary photos give unreliable results.</li>
        </ul>
      </Card>
      <Card>
        <h2>Common problems</h2>
        <dl className="meta">
          <dt>Unsupported file</dt><dd>Use a JPEG, PNG or WebP image.</dd>
          <dt>Too large</dt><dd>The limit is 10 MB. Export a smaller copy and try again.</dd>
          <dt>Not a valid image</dt><dd>The file may be corrupted or renamed. Re-export it from the original.</dd>
          <dt>Cannot reach the API</dt><dd>Start the backend, then check <Link to="/app/system-status">System status</Link>.</dd>
          <dt>Took too long</dt><dd>The server may be busy or starting up. Try again in a moment.</dd>
        </dl>
      </Card>
      <Card>
        <h2>Reading results responsibly</h2>
        <p style={{ margin: 0 }}>Probabilities are model outputs, not medical findings. They cannot diagnose or rule out skin cancer. See a healthcare professional about any concerning lesion.</p>
      </Card>
    </div>
  );
}
