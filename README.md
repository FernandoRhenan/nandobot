![Scraper](https://fernandorhenan.github.io/public/scraping.png)

![Publicador de posts](https://fernandorhenan.github.io/public/publisher.png)

# Passo a passo de como rodar a aplicação.

Veja os pré-requisitos:

#### Desenvolvimento

• Saber usar o basico do Github e Git

#### Produção

• Saber acessar um servidor remoto via SSH e configurar as chaves do SSH para acesso programático.

• Ter conta no Dockerhub e ter um token de acesso programático para acessar o Dockerhub e subir imagens Docker (Enviadas automaticamente através da pipeline de deploy).

---

## Em desenvolvimento / localmente

Dependências:

• Git

• nodejs 24.x

• python 3.x

• docker 29.x

### Primeiros passos:

1° - rodar `git clone https://github.com/FernandoRhenan/nandobot.git`

2° - entrar via terminal na pasta que foi clonada: `cd nandobot`

### Instalando dependencias do Python:

1° - rodar: `python3 -m venv .venv`

2° - rodar: (apenas Linux) `sudo chmod x+ .venv/bin/activate`

3° - rodar:
(Linux) `.venv/bin/activate`
(Windows) `.venv\Scripts\Activate.ps1`

4° - rodar: `.venv/bin/pip install -r requirements.txt`

### Instalando dependencias do NodeJs:

1° - rodar `npm i`

### Rodando projeto:

`npm run dev`

*OBS:

Se você não pretende rodar em produção, você deve remover os arquivos:

`.github/baseSetup.yaml` e `.github/deploy.yaml`

Pois eles irão rodar uma pipeline de deploy para um servidor, o que causará erro se nenhum servidor estiver configurado.

---

## Em produção / remotamente

### Fork do projeto

1° - faça um fork de https://github.com/FernandoRhenan/nandobot.git

2° - rode `git clone <SUA URL>` com a url do seu novo fork

3° - acesse seu projeto no github, vá em `settings → Secrets and variables → Actions`.

Lá defina, em `Variables`:

• DOCKERHUB_TAG_NEXTJS=<NOME_DA_SUA_TAG_DA_IMAGEM_NEXTJS_NO_DOCKERHUB>

• DOCKERHUB_TAG_NGINX=<NOME_DA_SUA_TAG_DA_IMAGEM_NGINX_NO_DOCKERHUB>

• DOCKERHUB_USERNAME=<SEU_USERNAME_DO_DOCKERHUB>

• NEXT_PUBLIC_SOCKET_URL=<A_URL_DO_SEU_SITE>

• VPS_IP_ADDRESS=<O_ENDEREÇO_IP_DO_SEU_SERVIDOR/VPS>

Defina as `Secrets`:

• DOCKERHUB_TOKEN=<SEU_TOKEN_CRIADO_PARA_ACESSO_PROGRAMATICO_LÁ_NO_DOCKERHUB>

• VPS_SSH_KEY=<CHAVE_SECRETA_DO_SSH>

• VPS_USER=<USUÁRIO_DA_SUA_VPS_(GERALMENTE ROOT)>

---

### Antes de subir os arquivos para o servidor

1° - Atualize o arquivo `nginx/conf.d/nandobot.conf`:

• Atualize o `server_name` para seus domínios: - www.exemple.com exemple.com

• Atualize o `ssl_certificate_key` e `ssl_certificate` aonde está o '<SUBSTITUA POR SEU DOMÍNIO>' com seu próprio domínio.

2° - Atualize o arquivo `deploy/docker/compose.prod.yaml`:

• Atualize `volumes` do service `nginx` aonde está o '<SUBSTITUA POR SEU DOMÍNIO>' com seu próprio domínio.

3° - Atualize o arquivo `deploy/setup.sh`:

• Substitua <SUA_TAG_DO_NEXTJS_NO_DOCKERHUB> e <SUA_TAG_DO_NGINX_NO_DOCKERHUB>

---

### Setup do servidor

1° - Entre via ssh no seu servidor.

2° - Rode `nano /app/.env.production` e insira as variáveis que estão no projeto local no arquivo `.env.production`.

3° - Preencha os valores das variáveis.

4° - Rode `sudo snap install --classic certbot` para instalar o certbot.

5° - Rode `sudo ln -s /snap/bin/certbot /usr/local/bin/certbot` para criar um link simbólico.

6° - Rode `sudo certbot certonly --standalone` para começar o processo de criação do certificado.

7° - De as permissões para os arquivos que o certbot criou:

`sudo chmod 755 /etc/letsencrypt/live/<ALTERE PELO SEU DOMÍNIO>/`

`sudo chmod 755 /etc/letsencrypt/archive/<ALTERE PELO SEU DOMÍNIO>/`

`sudo chmod 644 /etc/letsencrypt/live/<ALTERE PELO SEU DOMÍNIO>/privkey.pem`

`sudo chmod 644 /etc/letsencrypt/live/<ALTERE PELO SEU DOMÍNIO>/fullchain.pem`

Não se esqueça de substituir '<ALTERE PELO SEU DOMÍNIO>' pelo seu domínio cadastrado.

É isso, seu ssl esta configurado. Em 90 dias você precisará renovar.

---

## Em caso de dúvidas

Você pode criar uma nova issue no Github ou entrar em contato através do LinkedIn do fundador do projeto. O link estará em seu perfil aqui do Github.
