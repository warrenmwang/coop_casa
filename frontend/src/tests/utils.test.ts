import React from "react";
import "test-utils";
import { OrderedFile, UserDetails } from "types/Types";
import {
  apiFile2ClientFile,
  fileArray2OrderedFileArray,
  isAccountSetup,
  orderedFileArray2FileArray,
} from "utils/utils";

describe("apiFile2ClientFile", () => {
  const testCases = [
    {
      name: "valid PDF file",
      input: {
        fileName: "document.pdf",
        mimeType: "application/pdf",
        size: 376,
        data: "JVBERi0xLjAKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqIDIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iaiAzIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCAzIDNdPj5lbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMTAgMDAwMDAgbgowMDAwMDAwMDUzIDAwMDAwIG4KMDAwMDAwMDEwMiAwMDAwMCBuCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxNDkKJUVPRgo=",
      },
      expectedOutput: {
        name: "document.pdf",
        type: "application/pdf",
        size: 281,
      },
    },
    {
      name: "valid image file",
      input: {
        fileName: "image.png",
        mimeType: "image/png",
        size: 936,
        data: "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw1AUhU9bpVJaHKwo4pChOlkQFXHUKhShQqgVWnUweekfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE2cFJ0UVKvC8ptIjxwuN9nHfP4b37AH+jwlSzaxxQNctIJxNCNrcqBF8RwgB8iKBfYqY+J4opeNbXPXVS3cV5lnffnxVR8iYDfALxLNMNi3iDeHrT0jnvE0dZSVKIz4nHDLog8SPXZZffOBcd9vPMqJFJzxNHiYViB8sdzEqGSjxFHFNUjfL9WZcVzluc1UqNte7JXxjOayvLXKc1jCQWsQQRAmTUUEYFFuK0a6SYSNN5wsM/5PhFcsnkKoORYwFVqJAcP/gf/J6tWZiccJPCCaD7xbY/RoDgLtCs2/b3sW03T4DAM3Cltf3VBjDzSXq9rcWOgN5t4OK6rcl7wOUOMPikS4bkSAFa/kIBeD+jb8oBfbdAaM2dW+scpw9AhmaVugEODoHRImWve7y7p3Nu//a05vcDHmdyhUobQ14AAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfoChcBDyF7jiJuAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAKVJREFUGNN9j7EOwWAYRU/NFgY1SKRNLHYxIRaMNiaTwQsYdOiTeAOxG0qYDO0g6Uv8D9AaLNegpCVxpvvdk9zkQzl8T8bkC/FJxshBq2VBl3hj2wC3K3lKFKk1/uovvnWl+qP3O1yL0xFA4nJmsyZNed2aTeWgyUCLueJYrbK6bY16kmQliYYdHnfqTQ4XANfKlrcBRKGiUOO+jkH2ve/JQQ6S9ATsTnQYyxJkpQAAAABJRU5ErkJggg==",
      },
      expectedOutput: {
        name: "image.png",
        type: "image/png",
        size: 700,
      },
    },
    {
      name: "empty file",
      input: {
        fileName: "empty.txt",
        mimeType: "text/plain",
        size: 0,
        data: "",
      },
      expectedOutput: null,
    },
    {
      name: "text file with content",
      input: {
        fileName: "hello.txt",
        mimeType: "text/plain",
        size: 20,
        data: "SGVsbG8sIFdvcmxkIQ==", // "Hello, World!"
      },
      expectedOutput: {
        name: "hello.txt",
        type: "text/plain",
        size: 13,
      },
    },
  ];

  test.each(testCases)(
    "converts $name correctly",
    ({ input, expectedOutput }) => {
      const result = apiFile2ClientFile(input);

      if (expectedOutput === null) {
        expect(result).toBeNull();
      } else {
        expect(result).not.toBeNull();
        expect(result?.name).toBe(expectedOutput.name);
        expect(result?.type).toBe(expectedOutput.type);
        expect(result?.size).toBe(expectedOutput.size);
      }
    },
  );

  test("creates a Blob with correct content", () => {
    const input = testCases[3].input; // Using the text file case
    const result = apiFile2ClientFile(input) as File;

    expect(result).not.toBeNull();
    expect(result.name).toBe("hello.txt");
    expect(result.type).toBe("text/plain");

    // Read the content of the File
    const reader = new FileReader();
    reader.readAsText(result);
    reader.onload = () => {
      expect(reader.result).toBe("Hello, World!");
    };
  });
});

describe("orderedFileArray2FileArray", () => {
  const testCases = [
    {
      name: "ordered files",
      input: [
        {
          orderNum: 0,
          file: new File(["content1"], "file1.txt", { type: "text/plain" }),
        },
        {
          orderNum: 1,
          file: new File(["content2"], "file2.txt", { type: "text/plain" }),
        },
        {
          orderNum: 2,
          file: new File(["content3"], "file3.txt", { type: "text/plain" }),
        },
      ],
      expectedOutput: [
        { name: "file1.txt", type: "text/plain", size: 8 },
        { name: "file2.txt", type: "text/plain", size: 8 },
        { name: "file3.txt", type: "text/plain", size: 8 },
      ],
    },
    {
      name: "unordered files",
      input: [
        {
          orderNum: 2,
          file: new File(["content3"], "file3.txt", { type: "text/plain" }),
        },
        {
          orderNum: 0,
          file: new File(["content1"], "file1.txt", { type: "text/plain" }),
        },
        {
          orderNum: 1,
          file: new File(["content2"], "file2.txt", { type: "text/plain" }),
        },
      ],
      expectedOutput: [
        { name: "file1.txt", type: "text/plain", size: 8 },
        { name: "file2.txt", type: "text/plain", size: 8 },
        { name: "file3.txt", type: "text/plain", size: 8 },
      ],
    },
    {
      name: "files with gaps",
      input: [
        {
          orderNum: 0,
          file: new File(["content1"], "file1.txt", { type: "text/plain" }),
        },
        {
          orderNum: 2,
          file: new File(["content3"], "file3.txt", { type: "text/plain" }),
        },
        {
          orderNum: 4,
          file: new File(["content5"], "file5.txt", { type: "text/plain" }),
        },
      ],
      expectedOutput: [
        { name: "file1.txt", type: "text/plain", size: 8 },
        undefined,
        { name: "file3.txt", type: "text/plain", size: 8 },
        undefined,
        { name: "file5.txt", type: "text/plain", size: 8 },
      ],
    },
    {
      name: "empty input",
      input: [],
      expectedOutput: [],
    },
  ];

  test.each(testCases)(
    "converts $name correctly",
    ({ input, expectedOutput }) => {
      const result = orderedFileArray2FileArray(input);

      expect(result.length).toBe(expectedOutput.length);

      result.forEach((file, index) => {
        const curr = expectedOutput[index];
        if (curr === undefined) {
          expect(file).toBeUndefined();
        } else {
          expect(file).toBeDefined();
          expect(file.name).toBe(curr.name);
          expect(file.type).toBe(curr.type);
          expect(file.size).toBe(curr.size);
        }
      });
    },
  );

  test("maintains correct order with mixed input", () => {
    const input: OrderedFile[] = [
      {
        orderNum: 2,
        file: new File(["content3"], "file3.txt", { type: "text/plain" }),
      },
      {
        orderNum: 0,
        file: new File(["content1"], "file1.txt", { type: "text/plain" }),
      },
      {
        orderNum: 3,
        file: new File(["content4"], "file4.txt", { type: "text/plain" }),
      },
      {
        orderNum: 1,
        file: new File(["content2"], "file2.txt", { type: "text/plain" }),
      },
    ];

    const result = orderedFileArray2FileArray(input);

    expect(result.length).toBe(4);
    expect(result[0].name).toBe("file1.txt");
    expect(result[1].name).toBe("file2.txt");
    expect(result[2].name).toBe("file3.txt");
    expect(result[3].name).toBe("file4.txt");
  });

  test("handles large orderNum values", () => {
    const input: OrderedFile[] = [
      {
        orderNum: 1000,
        file: new File(["content1"], "file1.txt", { type: "text/plain" }),
      },
    ];

    const result = orderedFileArray2FileArray(input);

    expect(result.length).toBe(1001);
    expect(result[1000].name).toBe("file1.txt");
    for (let i = 0; i < 1000; i++) {
      expect(result[i]).toBeUndefined();
    }
  });
});

describe("fileArray2OrderedFileArray", () => {
  const testCases = [
    {
      name: "multiple files",
      input: [
        new File(["content1"], "file1.txt", { type: "text/plain" }),
        new File(["content2"], "file2.txt", { type: "text/plain" }),
        new File(["content3"], "file3.txt", { type: "text/plain" }),
      ],
      expectedLength: 3,
    },
    {
      name: "single file",
      input: [new File(["content"], "file.txt", { type: "text/plain" })],
      expectedLength: 1,
    },
    {
      name: "empty array",
      input: [],
      expectedLength: 0,
    },
    {
      name: "files with different types",
      input: [
        new File(["content1"], "file1.txt", { type: "text/plain" }),
        new File(["content2"], "file2.png", { type: "image/png" }),
        new File(["content3"], "file3.pdf", { type: "application/pdf" }),
      ],
      expectedLength: 3,
    },
  ];

  test.each(testCases)("$name", ({ input, expectedLength }) => {
    const res = fileArray2OrderedFileArray(input);
    expect(res).toHaveLength(expectedLength);
    res.forEach((of, i) => {
      expect(of).toHaveProperty("orderNum", i);
      expect(of).toHaveProperty("file", input[i]);
    });
  });
});

describe("isAccountSetup", () => {
  const testCases = [
    {
      name: "fully set up account",
      input: {
        firstName: "John",
        lastName: "Doe",
        birthDate: "1990-01-01",
        gender: "Male",
        location: "New York",
        interests: ["Reading", "Hiking"],
      },
      expected: true,
    },
    {
      name: "missing first name",
      input: {
        firstName: "",
        lastName: "Doe",
        birthDate: "1990-01-01",
        gender: "Male",
        location: "New York",
        interests: ["Reading", "Hiking"],
      },
      expected: false,
    },
    {
      name: "missing last name",
      input: {
        firstName: "John",
        lastName: "",
        birthDate: "1990-01-01",
        gender: "Male",
        location: "New York",
        interests: ["Reading", "Hiking"],
      },
      expected: false,
    },
    {
      name: "missing birth date",
      input: {
        firstName: "John",
        lastName: "Doe",
        birthDate: "",
        gender: "Male",
        location: "New York",
        interests: ["Reading", "Hiking"],
      },
      expected: false,
    },
    {
      name: "missing gender",
      input: {
        firstName: "John",
        lastName: "Doe",
        birthDate: "1990-01-01",
        gender: "",
        location: "New York",
        interests: ["Reading", "Hiking"],
      },
      expected: false,
    },
    {
      name: "missing location",
      input: {
        firstName: "John",
        lastName: "Doe",
        birthDate: "1990-01-01",
        gender: "Male",
        location: "",
        interests: ["Reading", "Hiking"],
      },
      expected: false,
    },
    {
      name: "empty interests",
      input: {
        firstName: "John",
        lastName: "Doe",
        birthDate: "1990-01-01",
        gender: "Male",
        location: "New York",
        interests: [],
      },
      expected: false,
    },
    {
      name: "all fields empty",
      input: {
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "",
        location: "",
        interests: [],
      },
      expected: false,
    },
  ];

  test.each(testCases)("$name", ({ input, expected }) => {
    expect(isAccountSetup(input as UserDetails)).toBe(expected);
  });
});
