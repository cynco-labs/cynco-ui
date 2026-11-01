# Image

Renders an AI SDK generated image from base64.

```tsx
import { Image } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Image } from "@cynco-labs/ui/ai";

export default function ImageDemo() {
	return (
		<Image
			base64="iVBORw0KGgoAAAANSUhEUgAAAKAAAABgCAIAAAAVRe7OAAABlElEQVR4Xu3bQQ6CMBQA0WKMZ3LloTyFKw/lsdxoDIlhye+n2g7z1jYURzDYOt3OryKuA/fU9GFgOAPDGRjOwHAGhjMwnIHhDAxnYDgDwxkYzsBwBoYzMJyB4QwMZ2A4A8Mdq8/v+niuH3u/nNa/eFs7n+dUseku9JYt/Tiz83RPFl/4O7j6siglNTbKec7CgTUWA8MZGM7AcAaGMzCcgeEMDGdgOAPDGRjOwHAGhjMwXDhwZtE+MzYqc6zM2KjMsdaMDQfWWGq27MxCK+prPmuN7Hye9YE1BG/RcAaGMzCcgeEMDGdguPr/JrWw82fWFnp5Dg6lXfrxTyijzPPLWzRcF4GrL4voL6ZJo8xzqYvAasfAcAaGMzCcgeEMDGdgOAPDGRjOwHAGhjMwnIHhDAzXReDMon1mbFTmWJmxGV0EVju9bNmZhVbU/3VNDDTPUjoLrM15i4YzMJyB4QwMZ2A4A8MZGM7AcAaGMzCcgeEMDGdgOAPDGRjOwHAGhjMwnIHhDAxnYDgDwxkYzsBwBoYzMNwbRDVX90h9k24AAAAASUVORK5CYII="
			uint8Array={new Uint8Array()}
			mediaType="image/png"
			alt="Generated chart"
			className="h-24 w-auto rounded-lg border"
		/>
	);
}
```

## Use

Images returned by an image model.

## Props

`base64`, `mediaType`, `uint8Array`, `alt`, `className`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/image.tsx`.
