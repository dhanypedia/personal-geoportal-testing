
const getData = async (access_token) => {
    const response = await fetch(`${process.env.BASE_URL}/api/katalog-data-3d/list`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${access_token}`
        }
    });

    const { data } = await response.json();
    return data;
}

export default getData;