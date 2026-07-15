const API_URL = "http://localhost:8080/api/doctors";

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function getDoctors() {
  const response = await fetch(API_URL);
  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load doctors");
  }

  return data;
}

export async function createDoctor(
  fullName,
  email,
  temporaryPassword
) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName,
      email,
      temporaryPassword,
    }),
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create doctor"
    );
  }

  return data;
}

export async function deleteDoctor(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete doctor"
    );
  }

  return data;
}