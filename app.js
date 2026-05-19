const SUPABASE_URL = "https://izpdgeliyaqwopoxxzak.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_fMhmxHNgAdmPgbvFOMwWQQ_9hXrbXCw";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let promptData = [];

let currentCategory = 'all';

async function fetchPromptsFromDatabase() {

    try {

        const { data, error } = await supabaseClient
            .from('prompts')
            .select('*')
            .order('created_at', { ascending:false });

        if(error) throw error;

        promptData = data;

        displayPrompts(promptData);

    } catch(error) {

        console.error(error);

        document.getElementById('promptContainer').innerHTML = `
            <p class="loading">
                Gagal memuat data
            </p>
        `;
    }
}

function displayPrompts(prompts) {

    const container = document.getElementById('promptContainer');

    container.innerHTML = '';

    if(prompts.length === 0){

        container.innerHTML = `
            <p class="loading">
                Prompt tidak ditemukan
            </p>
        `;

        return;
    }

    prompts.forEach(prompt => {

        const shortText =
            prompt.text.length > 180
            ? prompt.text.substring(0,180) + '...'
            : prompt.text;

        const card = document.createElement('div');

        card.className = 'card';

        card.innerHTML = `
            <div>

                <span class="badge">
                    ${prompt.category}
                </span>

                <h3>${prompt.title}</h3>

                 <div 
                  class="prompt-text"
                 id="prompt-${prompt.id}"
                 data-full="${encodeURIComponent(prompt.text)}"
                 data-short="${encodeURIComponent(shortText)}"
                 >
                  ${shortText}
                 </div>

                <button 
                    class="view-more-btn"
                    onclick="togglePrompt(${prompt.id})"
                >
                    View More
                </button>

            </div>

            <button
                class="copy-btn"
                onclick="copyToClipboard('prompt-${prompt.id}')"
            >
                Copy Prompt
            </button>
        `;

        container.appendChild(card);
    });
}

function togglePrompt(id){

    const promptElement =
        document.getElementById(`prompt-${id}`);

    const button =
        promptElement.nextElementSibling;

    const fullText =
        decodeURIComponent(
            promptElement.dataset.full
        );

    const shortText =
        decodeURIComponent(
            promptElement.dataset.short
        );

    if(button.innerText === 'View More'){

        promptElement.innerText = fullText;

        button.innerText = 'View Less';

    } else {

        promptElement.innerText = shortText;

        button.innerText = 'View More';
    }
}


function copyToClipboard(elementId){

    const text =
        document.getElementById(elementId).innerText;

    navigator.clipboard.writeText(text);

    showToast();
}

function showToast(){

    const toast =
        document.getElementById('toast');

    toast.classList.add('show');

    setTimeout(() => {

        toast.classList.remove('show');

    },2500);
}

function filterPrompts(){

    const keyword =
        document.getElementById('searchBar')
        .value
        .toLowerCase();

    const filtered = promptData.filter(prompt => {

        const matchesSearch =
            prompt.title.toLowerCase().includes(keyword)
            ||
            prompt.text.toLowerCase().includes(keyword);

        const matchesCategory =
            currentCategory === 'all'
            ||
            prompt.category === currentCategory;

        return matchesSearch && matchesCategory;
    });

    displayPrompts(filtered);
}

function filterCategory(category, buttonElement){

    currentCategory = category;

    document
        .querySelectorAll('.category-btn')
        .forEach(btn => btn.classList.remove('active'));

    buttonElement.classList.add('active');

    filterPrompts();
}

fetchPromptsFromDatabase();

function toggleSidebar(){

    document
        .getElementById('sidebar')
        .classList.toggle('active');

    document
        .querySelector('.sidebar-overlay')
        .classList.toggle('active');
}

function closeSidebar(){

    document
        .getElementById('sidebar')
        .classList.remove('active');

    document
        .querySelector('.sidebar-overlay')
        .classList.remove('active');
}