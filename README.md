# Donaton Backend — Despliegue en Amazon EKS

> **Evaluación Parcial N°3 — ISY1101 DevOps**  
> Dupla: Remi García / Ricardo Díaz  
> Rol de este repositorio: **Backend** (NextJS 16 (App Router) + MySQL + Docker)  
> Orquestación: **Amazon EKS** | Pipeline: **GitHub Actions → ECR → EKS**

---

## Descripción general

Este repositorio contiene una parte del backend del proyecto de software de la fundación **Donaton**, que corresponde a una plataforma de coordinación de donaciones humanitarias. Acá se implementaron los endpoints con los que interactúa el frontend de la **vista de donaciones** (el cual se encuentra en [https://github.com/rem-garcia/donaton-front-eks/](https://github.com/rem-garcia/donaton-front-eks/)), con el objetivo de demostrar la comunicación real entre ambas capas de la plataforma desplegadas en el servicio EKS de AWS.

La arquitectura implementada cubre:

- Clúster EKS con Auto Mode en AWS Academy (us-east-1)
- Imagen Docker publicada en Amazon ECR
- Despliegue via manifiestos YAML de Kubernetes (Deployment + Service LoadBalancer)
- Escalamiento automático con HPA (Horizontal Pod Autoscaler)
- Pipeline CI/CD completo con GitHub Actions
- Observabilidad con CloudWatch y kubectl

---

## Arquitectura

```
Usuario
  │
  ▼
[LoadBalancer EKS - Frontend]        [LoadBalancer EKS - Backend (Ricardo)]
  │  donaton-front-eks (us-east-1)     donaton-back-eks (us-east-1)
  │                                      │
  ▼                                      ▼
[Pod: donaton-frontend]  ──HTTP──►  [Pod: donaton-backend]
  ECR: TU_ACCOUNT_ID                  ECR: ACCOUNT_RICARDO
  Imagen: donaton-frontend:eks-v1     Imagen: donaton-backend:eks-v1
```

**Decisión arquitectónica:** al trabajar con cuentas AWS Academy separadas, la comunicación entre servicios se realiza mediante URL pública del LoadBalancer del backend. Esto se configura como variable de entorno `VITE_API_URL` en el Deployment de Kubernetes.

---

## Estructura del repositorio

```
backend-donaton/
│   .dockerignore
│   .gitignore
│   docker-compose.yml
│   next-env.d.ts
│   next.config.ts
│   package-lock.json
│   package.json
│   prisma.config.ts
│   proxy.ts
│   README.md
│   tsconfig.json
│   
│               
├───app/
│   └───api/
│       └───donaciones
│               route.ts
│               
├───k8s/
│       backend-deployment.yml
│       backend-hpa.yml
│       backend-service.yml
│       mysql-deployment.yml
│       mysql-secret.yml
│       mysql-service.yml
│       namespace.yml
│       prisma-secret.yml
│       
├───mysql-container/
│       Dockerfile
│       init.sql
│       
├───nextjs-container/
│       Dockerfile
│       
│           
├───prisma/
│   │   schema.prisma
│   │   
│   └───migrations/
│       │   migration_lock.toml
│       │   
│       └───20260624080053_init
│               migration.sql
│               
└───src
    ├───lib
    │       prisma.ts
    │       
    ├───repository
    │       donacion.repository.ts
    │       
    └───service
            donacion.service.ts
```

---

## Configuración con variables de entorno

Estando en la carpeta raíz, crea un archivo `.env` con las siguientes variables de entorno que te serviran para que tanto MySQL como Prisma se ejecuten correctamente:

```env
DATABASE_URL="mysql://donaton:Duoc2026@db-mysql:3306/donaton_db"
SHADOW_DATABASE_URL="mysql://donaton:Duoc2026@db-mysql:3306/shadow_donaton_db"

DATABASE_USER="donaton"
DATABASE_PASSWORD="Duoc2026"
DATABASE_NAME="donaton_db"
DATABASE_HOST="db-mysql"
DATABASE_PORT="3306"
ROOT_PASSWORD="root2025"
```

Estos valores son solo para propósitos académicos y demostrativos. Se recomienda usar valores más seguros, robustos y no exponerlos al público en entornos productivos y de negocio.

## Requisitos previos

### Herramientas locales

| Herramienta | Version minima | Instalacion |
|---|---|---|
| AWS CLI | v2 | https://aws.amazon.com/cli/ |
| kubectl | v1.30+ | https://kubernetes.io/docs/tasks/tools/ |
| Docker Desktop | v24+ | https://www.docker.com/products/docker-desktop/ |
| Node.js | v18+ | https://nodejs.org/ |

---

## Configuracion del cluster EKS

### Cluster creado

| Parametro | Valor |
|---|---|
| Nombre | `donaton-eks` |
| Region | `us-east-1` |
| Version Kubernetes | 1.35 |
| Modo | EKS Auto Mode |
| VPC | VPC Predeterminada AWS Academy |
| Subredes | 5 subredes publicas (us-east-1a/b/c/d/f) |
| Endpoint access | Publico y Privado |
| Logs habilitados | api, audit, authenticator, controllerManager, scheduler |

### Roles IAM utilizados

| Rol | Proposito |
|---|---|
| `LabEksClusterRole` | Permite al control plane de EKS gestionar recursos AWS |
| `LabEksNodeRole` | Permite a los nodos EC2 unirse al cluster y acceder a ECR |

**Justificacion:** AWS Academy provee estos roles preconfigurados con los permisos minimos necesarios para operar EKS. El `LabEksClusterRole` se asigna al control plane y el `LabEksNodeRole` a los nodos worker.

### Conectar kubectl al cluster

```powershell
# Configurar credenciales AWS Academy
aws configure
aws configure set aws_session_token "TU_SESSION_TOKEN"

# Descargar kubeconfig
aws eks update-kubeconfig --region us-east-1 --name donaton-front-eks

# Verificar conexion
kubectl get nodes
```

---

### Publicar imagen en ECR

```bash
# Login ECR
aws ecr get-login-password --region us-east-1 | docker login \
  --username AWS \
  --password-stdin TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build, tag y push

# Build + container de MySQL (esperar a que se inicie completamente el motor de base de datos)
docker compose up db-mysql 

# Build + container de backend NextJS + ORM Prisma
docker compose up backend-nextjs 

# Despliegue de imagenes de MySQL y del Backend a AWS ECR.
docker tag donaton-db:latest \
  TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/donaton-db:eks-v1

docker push \
  TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/donaton-db:eks-v1

docker tag donaton-backend:latest \
  TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/donaton-backend:eks-v1

docker push \
  TU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/donaton-backend:eks-v1
```

> Reemplazar `TU_ACCOUNT_ID` con el ID de 12 digitos de tu cuenta AWS.

---

## Manifiestos de Kubernetes

### Despliegue completo

En esta sección se despliegan los manifiestos que permiten el despliegue de los pods al cluster `donaton-eks` ubicado en AWS EKS.

```bash
cd k8s/

# 1. Crear namespace
kubectl apply -f namespace.yml

# 2. Despliegue base de datos
kubectl apply -f mysql-secret.yml
kubectl apply -f mysql-deployment.yml
kubectl apply -f mysql-service.yml

# 3. Despliegue backend
kubectl apply -f prisma-secret.yml
kubectl apply -f backend-deployment.yml
kubectl apply -f backend-service.yml

# 4. Configuracion autoscaling
kubectl apply -f backend-hpa.yml

# Verificar
kubectl get pods -n donaton
kubectl get svc -n donaton
kubectl get hpa -n donaton
```

## Pipeline CI/CD

### Secrets configurados en GitHub

| Secret | Descripcion |
|---|---|
| `AWS_ACCESS_KEY_ID` | Credencial de acceso AWS Academy |
| `AWS_SECRET_ACCESS_KEY` | Credencial secreta AWS Academy |
| `AWS_SESSION_TOKEN` | Token de sesion AWS Academy (renovar cada sesion) |
| `AWS_REGION` | `us-east-1` |
| `AWS_ACCOUNT_ID` | ID de cuenta AWS (12 digitos) |
| `EKS_CLUSTER_NAME` | `donaton-front-eks` |
| `ECR_REPOSITORY` | `donaton-frontend` |
| `VITE_API_URL` | URL publica del backend de Ricardo |

> Los valores sensibles nunca se exponen en el codigo. Se gestionan exclusivamente como Secrets en GitHub Actions.

### Flujo del pipeline (.github/workflows/deploy-eks.yml)

```
Push a main
    │
    ▼
[1. Checkout codigo]
    │
    ▼
[2. Configurar credenciales AWS]
    │
    ▼
[3. Login en Amazon ECR]
    │
    ▼
[4. Docker build + tag + push → ECR]
    │
    ▼
[5. Actualizar kubeconfig]
    │
    ▼
[6. kubectl apply → EKS]
    │
    ▼
[Aplicacion actualizada en cluster]
```

---

## Validacion del despliegue

### Verificar pods y servicios

```bash
# Estado de pods
kubectl get pods -n donaton

# Obtener URL publica del frontend
kubectl get svc donaton-frontend -n donaton

# Logs del pod
kubectl logs -l app=donaton-frontend -n donaton

# Metricas de uso
kubectl top pods -n donaton
kubectl top nodes
```

### Resultado esperado

```
NAME                                  READY   STATUS    RESTARTS   AGE
donaton-frontend-xxxx-xxxx            1/1     Running   0          2m

NAME                TYPE           EXTERNAL-IP                        PORT(S)
donaton-frontend    LoadBalancer   abc123.us-east-1.elb.amazonaws.com 80:XXXXX/TCP
```

Abrir el EXTERNAL-IP en el navegador para acceder al frontend. La vista de donaciones debe cargar y enviar datos al backend de Ricardo correctamente.

---

## Autoscaling — HPA

### Validar HPA

```bash
kubectl get hpa -n donaton
```

### Simular carga para activar escalado

```bash
# Entrar al pod
kubectl exec -it <nombre-pod-backend> -n donaton -- sh

# Ejecutar loop de carga
while true; do wget -q -O- http://localhost:3000 > /dev/null; done
```

### Desde otra terminal, observar el escalado

```bash
kubectl get hpa -n donaton -w
```

Resultado esperado: el HPA aumenta replicas de 1 → 2 → 3 segun el uso de CPU supere el 70%.

---

## Tolerancia a fallos (Auto-healing)

```bash
# Obtener pods actuales del backend
kubectl get pods -n donaton -l app=donaton-backend

# Eliminar un pod (simula fallo)
kubectl delete pod <nombre-pod-backend> -n donaton

# Observar como Kubernetes crea uno nuevo automaticamente
kubectl get pods -n donaton -w
```

El ReplicaSet detecta que hay menos replicas de las deseadas y crea un pod nuevo en segundos.

---

## Observabilidad

### CloudWatch — Logs del control plane

1. Ir a **CloudWatch → Logs → Log groups**
2. Buscar: `/aws/eks/donaton-front-eks/cluster`
3. Revisar logs de: `kube-apiserver`, `audit`, `scheduler`, `controllerManager`

### Metricas desde kubectl

```bash
kubectl top nodes
kubectl top pods -n donaton
```

---

## Autores

| Nombre | Rol | GitHub |
|---|---|---|
| Remi Garcia | Frontend — EKS, ECR, Pipeline CI/CD | @rem-garcia |
| Ricardo Diaz | Backend — EKS, ECR, Pipeline CI/CD | @ric-diazs |

---

*Innovatech Chile — DuocUC 2026*
